// Role constants
export const ROLES = {
  RESPONSIBLE: "Responsible",
  ADMIN: "Admin",
  EMPLOYEE: "Employee",
} as const;

// Helper functions
export const isAdmin = (roleName: string): boolean => {
  return roleName === ROLES.ADMIN;
};

export const isEmployee = (roleName: string): boolean => {
  return roleName === ROLES.EMPLOYEE;
};

export const isResponsible = (roleName: string): boolean => {
  return roleName === ROLES.RESPONSIBLE;
};

export const canAccessAdminPages = (roleName: string): boolean => {
  return isAdmin(roleName) || isResponsible(roleName);
};

export const canAccessEmployeePages = (roleName: string): boolean => {
  return true; // All authenticated users can access employee pages
};
