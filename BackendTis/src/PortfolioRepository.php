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
            'SELECT id::text AS id, profile_id::text AS profile_id, name, email, role, password_hash
             FROM users
             WHERE email = :email
             LIMIT 1'
        );
        $stmt->execute([':email' => $email]);
        $row = $stmt->fetch();
        if (!$row) {
            return null;
        }

        $hash = (string) $row['password_hash'];
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
            'name' => $row['name'] ?? null,
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
                'createdAt' => $row['created_at'] ? (string) $row['created_at'] : null,
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
                'current' => (bool) $row['is_current'],
                'description' => $row['description'],
                'skills' => parsePgJsonArrayString($row['skills']),
            ];
        }
        return $out;
    }
    public function register(string $fullName, string $email, string $password): array
    {
        $fullName = trim($fullName);
        $email = trim($email);

        if ($fullName === '' || $email === '' || $password === '') {
            throw new InvalidArgumentException('Missing data');
        }

        $stmt = db()->prepare('SELECT 1 FROM users WHERE email = :email LIMIT 1');
        $stmt->execute([':email' => $email]);

        if ($stmt->fetchColumn()) {
            throw new RuntimeException('EMAIL_TAKEN');
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('INVALID_EMAIL');
        }

        if (strlen($password) < 6) {
            throw new InvalidArgumentException('PASSWORD_TOO_SHORT');
        }

        $pdo = db();
        $pdo->beginTransaction();

        try {
            // Crear perfil 
            $stmt = $pdo->prepare(
                'INSERT INTO profiles (full_name, role, bio, avatar_url, status)
             VALUES (:full_name, :role, :bio, :avatar_url, :status)
             RETURNING id::text'
            );

            $stmt->execute([
                ':full_name' => $fullName,
                ':role' => 'USER',
                ':bio' => '',
                ':avatar_url' => '',
                ':status' => 'ACTIVO',
            ]);

            $profileId = $stmt->fetchColumn();

            $hash = password_hash($password, PASSWORD_BCRYPT);

            // crear usuario
            $stmt = $pdo->prepare(
                'INSERT INTO users (email, password_hash, role, profile_id)
             VALUES (:email, :password_hash, :role, :profile_id)
             RETURNING id::text'
            );

            $stmt->execute([
                ':email' => $email,
                ':password_hash' => $hash,
                ':role' => 'USER',
                ':profile_id' => $profileId,
            ]);

            $userId = $stmt->fetchColumn();

            $pdo->commit();

            return [
                'userId' => $userId,
                'profileId' => $profileId,
                'fullName' => $fullName,
                'email' => $email,
                'role' => 'USER',
            ];

        } catch (\Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }
}

