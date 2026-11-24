# Adopts the roles and policies run-vault-post-init.sh created. Safe to keep
# after the first apply: an import block for an address already in state is a no-op.
import {
  for_each = local.policies
  to       = vault_policy.github_actions[each.key]
  id       = each.key
}

import {
  for_each = local.jwt_roles
  to       = vault_jwt_auth_backend_role.github_actions[each.key]
  id       = "auth/${var.jwt_backend}/role/${each.key}"
}
