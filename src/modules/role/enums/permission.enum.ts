export enum PermissionResource {
  USERS = "users",
  PRODUCTS = "products",
  ORDERS = "orders",
  PAYMENTS = "payments",
  DISCOUNTS = "discounts",
  SUPPORT = "support",
  BLOG = "blog",
  IMAGES = "images",
  CATEGORIES = "categories",
  ROLES = "roles",
  PERMISSIONS = "permissions",
  SETTINGS = "settings",
}

export enum PermissionAction {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  MANAGE = "manage", // Full access
}

export enum SystemRoles {
  SUPERADMIN = "Superadmin",
  ADMIN = "Admin",
  USER = "User",
  SUPPORT_AGENT = "Support Agent",
  CONTENT_MANAGER = "Content Manager",
  SALES_MANAGER = "Sales Manager",
}

export enum SystemPermissions {
  // User Management
  USER_CREATE = "users:create",
  USER_READ = "users:read",
  USER_UPDATE = "users:update",
  USER_DELETE = "users:delete",
  USER_MANAGE = "users:manage",

  // Product Management
  PRODUCT_CREATE = "products:create",
  PRODUCT_READ = "products:read",
  PRODUCT_UPDATE = "products:update",
  PRODUCT_DELETE = "products:delete",
  PRODUCT_MANAGE = "products:manage",

  // Order Management
  ORDER_CREATE = "orders:create",
  ORDER_READ = "orders:read",
  ORDER_UPDATE = "orders:update",
  ORDER_DELETE = "orders:delete",
  ORDER_MANAGE = "orders:manage",

  // Payment Management
  PAYMENT_CREATE = "payments:create",
  PAYMENT_READ = "payments:read",
  PAYMENT_UPDATE = "payments:update",
  PAYMENT_DELETE = "payments:delete",
  PAYMENT_MANAGE = "payments:manage",

  // Support Management
  SUPPORT_CREATE = "support:create",
  SUPPORT_READ = "support:read",
  SUPPORT_UPDATE = "support:update",
  SUPPORT_DELETE = "support:delete",
  SUPPORT_MANAGE = "support:manage",

  // Role Management
  ROLE_CREATE = "roles:create",
  ROLE_READ = "roles:read",
  ROLE_UPDATE = "roles:update",
  ROLE_DELETE = "roles:delete",
  ROLE_MANAGE = "roles:manage",

  // Permission Management
  PERMISSION_CREATE = "permissions:create",
  PERMISSION_READ = "permissions:read",
  PERMISSION_UPDATE = "permissions:update",
  PERMISSION_DELETE = "permissions:delete",
  PERMISSION_MANAGE = "permissions:manage",
}
