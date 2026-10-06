export function getGrowthHubUrl(): string {
    return import.meta.env.VITE_GROWTHHUB_URL || import.meta.env.VITE_SWITCH_PREP_URL || 'http://localhost:4000';
}

export async function openGrowthHub(): Promise<void> {
    const growthHubUrl = getGrowthHubUrl();
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/sso-session`, {
            credentials: 'include',
        });
        if (res.ok) {
            const body = await res.json();
            if (body.session) {
                window.location.href = `${growthHubUrl}/api/auth/sso-callback?session=${encodeURIComponent(body.session)}`;
                return;
            }
        }
    }
    catch {
        // fall through to plain link
    }
    window.location.href = growthHubUrl;
}

/** @deprecated use openGrowthHub */
export const openSwitchPrep = openGrowthHub;
