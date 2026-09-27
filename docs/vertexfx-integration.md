# VertexFX CRM integration

The backend supports two execution modes:

- `VERTEXFX_MODE=disabled`: existing PostgreSQL/local trading engine.
- `VERTEXFX_MODE=authoritative`: VertexFX owns account provisioning, orders, positions, and trade history. The local execution engine is not started.

Never enable authoritative mode against production first. Verify the supplied office/parent ID, account type IDs, credentials, and Backoffice login transport in a VertexFX demo/UAT environment.

## Activation

1. Apply the startup migration in `backend/database/update.sql` (normal backend startup does this automatically).
2. Fill every `VERTEXFX_*` value listed in `.env.example`.
3. Start with demo/UAT credentials and set `VERTEXFX_MODE=authoritative`.
4. Register a new test user and confirm `vertexfx_client_id` and both `vertexfx_account_id` values were populated.
5. Test symbol lookup, a market order, a pending order, SL/TP modification, cancellation, partial/full close, and history before enabling real accounts.

## Credential model

`VERTEXFX_CLIENT_USERNAME` must be a VertexFX integration login authorized to operate every account mapped by this website. If VertexFX supplies only client-scoped logins, do not use a shared credential: the adapter must be changed to maintain a separate server-side VertexFX session per website user. Client passwords must never be sent to the browser or stored unencrypted.

The Backoffice login is configurable because this installation exposes `BackofficeLogin` differently from the `*Post` methods:

```env
VERTEXFX_BACKOFFICE_LOGIN_PATH=BackofficeLogin
VERTEXFX_BACKOFFICE_LOGIN_METHOD=GET
```

Change those two values to the settings supplied by Hybrid Solutions/Postman if the tenant uses another binding.

## Operational safety

- VertexFX numeric IDs are stored separately from local website IDs.
- Every trading operation verifies that the selected local account belongs to the authenticated website user.
- WCF `d` responses and nested JSON strings are normalized by the transport adapter.
- The integration is fail-closed: missing configuration prevents authoritative-mode startup, and an unmapped account cannot trade.
