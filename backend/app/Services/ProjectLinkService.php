<?php

namespace App\Services;

use App\Models\Project;

class ProjectLinkService
{
    /**
     * Synchronize links for a given project.
     * This will delete all existing links and create the new ones provided.
     *
     * @param Project $project
     * @param array $links Array of associative arrays with 'platform_name' and 'url'
     * @return void
     */
    public function syncLinks(Project $project, array $links): void
    {
        // Remove existing links
        $project->links()->delete();

        // Create new links if provided
        if (!empty($links)) {
            $project->links()->createMany($links);
        }
    }
}
