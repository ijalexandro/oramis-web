export type OramisSectionPermissions = {
  conversations: boolean;
  metrics: boolean;
  business: boolean;
  admin: boolean;
};

export function getSectionPermissions(membership: unknown): OramisSectionPermissions {
  const m = membership as
    | {
        rol?: string | null;
        permisos?: {
          conversations?: boolean;
          metrics?: boolean;
          business?: boolean;
          admin?: boolean;
        } | null;
      }
    | null
    | undefined;

  const rol = String(m?.rol ?? "").toLowerCase();
  const permisos = m?.permisos ?? {};

  const isAdmin = rol === "owner" || rol === "admin" || permisos.admin === true;

  if (isAdmin) {
    return {
      conversations: true,
      metrics: true,
      business: true,
      admin: true,
    };
  }

  return {
    conversations: permisos.conversations === true,
    metrics: permisos.metrics === true,
    business: permisos.business === true,
    admin: false,
  };
}

export function canAccessSection(
  membership: unknown,
  section: keyof OramisSectionPermissions
) {
  return getSectionPermissions(membership)[section] === true;
}
