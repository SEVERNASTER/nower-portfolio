<?php

declare(strict_types=1);

require_once __DIR__ . '/Db.php';

function parsePgJsonArrayString(mixed $value): array
{
    if ($value === null) {
        return [];
    }
    if (is_array($value)) {
        return $value;
    }
    if (!is_string($value) || trim($value) === '') {
        return [];
    }

    $decoded = json_decode($value, true);
    return is_array($decoded) ? $decoded : [];
}

final class PortfolioRepository
{
    public function login(string $email, string $password): ?array
    {
        $stmt = db()->prepare(
            'SELECT id::text AS id, profile_id::text AS profile_id, email, role, password_hash
             FROM users
             WHERE email = :email
             LIMIT 1'
        );
        $stmt->execute([':email' => $email]);
        $row = $stmt->fetch();
        if (!$row) {
            return null;
        }

        $hash = (string)$row['password_hash'];
        $ok = false;

        // If bcrypt-like hash, verify properly; otherwise allow plain-text for dev.
        if (str_starts_with($hash, '$2')) {
            $ok = password_verify($password, $hash);
        } else {
            $ok = hash_equals($password, $hash);
        }

        if (!$ok) {
            return null;
        }

        return [
            'userId' => $row['id'],
            'profileId' => $row['profile_id'],
            'email' => $row['email'],
            'role' => $row['role'],
        ];
    }

    public function getProfile(string $profileId): ?array
    {
        $stmt = db()->prepare(
            'SELECT
                id::text AS id,
                full_name,
                role,
                bio,
                avatar_url,
                cover_url,
                status
             FROM profiles
             WHERE id = :id
             LIMIT 1'
        );
        $stmt->execute([':id' => $profileId]);
        $row = $stmt->fetch();
        if (!$row) {
            return null;
        }

        return [
            'id' => $row['id'],
            'fullName' => $row['full_name'],
            'role' => $row['role'],
            'bio' => $row['bio'],
            'avatarUrl' => $row['avatar_url'] ?? '',
            'coverUrl' => $row['cover_url'],
            'status' => $row['status'],
        ];
    }

    public function listProjects(string $profileId): array
    {
        $stmt = db()->prepare(
            'SELECT
                id::text AS id,
                title,
                description,
                status,
                array_to_json(tags) AS tags,
                repository_url,
                live_url,
                image_url,
                created_at
             FROM projects
             WHERE profile_id = :pid
             ORDER BY created_at DESC'
        );
        $stmt->execute([':pid' => $profileId]);
        $rows = $stmt->fetchAll();
        $out = [];
        foreach ($rows as $row) {
            $out[] = [
                'id' => $row['id'],
                'title' => $row['title'],
                'description' => $row['description'],
                'status' => $row['status'],
                'tags' => parsePgJsonArrayString($row['tags']),
                'repositoryUrl' => $row['repository_url'],
                'liveUrl' => $row['live_url'],
                'imageUrl' => $row['image_url'],
                'createdAt' => $row['created_at'] ? (string)$row['created_at'] : null,
            ];
        }
        return $out;
    }

    public function listSkills(string $profileId): array
    {
        $stmt = db()->prepare(
            'SELECT
                id::text AS id,
                name,
                category,
                level
             FROM skills
             WHERE profile_id = :pid
             ORDER BY created_at DESC'
        );
        $stmt->execute([':pid' => $profileId]);
        $rows = $stmt->fetchAll();
        $out = [];
        foreach ($rows as $row) {
            $out[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'category' => $row['category'],
                'level' => $row['level'],
            ];
        }
        return $out;
    }

    public function listExperiences(string $profileId): array
    {
        $stmt = db()->prepare(
            'SELECT
                id::text AS id,
                role,
                company,
                location,
                start_date,
                end_date,
                is_current,
                description,
                array_to_json(skills) AS skills
             FROM experiences
             WHERE profile_id = :pid
             ORDER BY created_at DESC'
        );
        $stmt->execute([':pid' => $profileId]);
        $rows = $stmt->fetchAll();
        $out = [];
        foreach ($rows as $row) {
            $out[] = [
                'id' => $row['id'],
                'role' => $row['role'],
                'company' => $row['company'],
                'location' => $row['location'],
                'startDate' => $row['start_date'],
                'endDate' => $row['is_current'] ? 'Presente' : ($row['end_date'] ?? ''),
                'current' => (bool)$row['is_current'],
                'description' => $row['description'],
                'skills' => parsePgJsonArrayString($row['skills']),
            ];
        }
        return $out;
    }
}

