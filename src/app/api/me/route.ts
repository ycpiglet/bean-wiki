import { getPlatformUser } from "@/lib/platform-auth";
import { getProfile } from "@/lib/platform-data";
import { storageUnavailableResponse } from "@/lib/platform-storage";

export async function GET() {
  const user = await getPlatformUser();
  if (!user) return Response.json({ user: null });
  const publicUser = {
    displayName: user.displayName,
    email: user.email,
    fullName: user.fullName,
    provider: user.provider,
    avatar: user.avatar,
  };
  try {
    return Response.json({ user: publicUser, ...(await getProfile(user)) });
  } catch (error) {
    return storageUnavailableResponse(
      error,
      { user: publicUser, profile: null, stats: {} },
      200,
    );
  }
}
