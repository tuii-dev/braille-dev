ALTER TABLE "File" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "File" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON "File";
CREATE POLICY tenant_isolation_policy ON "File" USING ("tenantId"::UUID = current_setting('app.current_tenant_id')::UUID);
CREATE POLICY bypass_rls_policy ON "File" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

ALTER TABLE "UserTenantRole" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserTenantRole" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON "UserTenantRole";
CREATE POLICY tenant_isolation_policy ON "UserTenantRole" USING ("tenantId"::UUID = current_setting('app.current_tenant_id')::UUID);
CREATE POLICY bypass_rls_policy ON "UserTenantRole" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON "Document";
CREATE POLICY tenant_isolation_policy ON "Document" USING ("tenantId"::UUID = current_setting('app.current_tenant_id')::UUID);
CREATE POLICY bypass_rls_policy ON "Document" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

ALTER TABLE "Workspace" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workspace" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON "Workspace";
CREATE POLICY tenant_isolation_policy ON "Workspace" USING ("tenantId"::UUID = current_setting('app.current_tenant_id')::UUID);
CREATE POLICY bypass_rls_policy ON "Workspace" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

ALTER TABLE "Model" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Model" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON "Model";
CREATE POLICY tenant_isolation_policy ON "Model" USING ("tenantId"::UUID = current_setting('app.current_tenant_id')::UUID);
CREATE POLICY bypass_rls_policy ON "Model" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

ALTER TABLE "ModelVersion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ModelVersion" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON "ModelVersion";
CREATE POLICY tenant_isolation_policy ON "ModelVersion" USING ("tenantId"::UUID = current_setting('app.current_tenant_id')::UUID);
CREATE POLICY bypass_rls_policy ON "ModelVersion" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

ALTER TABLE "WorkspaceModel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkspaceModel" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON "WorkspaceModel";
CREATE POLICY tenant_isolation_policy ON "WorkspaceModel" USING ("tenantId"::UUID = current_setting('app.current_tenant_id')::UUID);
CREATE POLICY bypass_rls_policy ON "WorkspaceModel" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

ALTER TABLE "WorkspaceDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkspaceDocument" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON "WorkspaceDocument";
CREATE POLICY tenant_isolation_policy ON "WorkspaceDocument" USING ("tenantId"::UUID = current_setting('app.current_tenant_id')::UUID);
CREATE POLICY bypass_rls_policy ON "WorkspaceDocument" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

ALTER TABLE "Definition" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Definition" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON "Definition";
CREATE POLICY tenant_isolation_policy ON "Definition" USING ("tenantId"::UUID = current_setting('app.current_tenant_id')::UUID);
CREATE POLICY bypass_rls_policy ON "Definition" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

ALTER TABLE "Node" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Node" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON "Node";
CREATE POLICY tenant_isolation_policy ON "Node" USING ("tenantId"::UUID = current_setting('app.current_tenant_id')::UUID);
CREATE POLICY bypass_rls_policy ON "Node" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

ALTER TABLE "DataExtractionJob" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DataExtractionJob" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON "DataExtractionJob";
CREATE POLICY tenant_isolation_policy ON "DataExtractionJob" USING ("tenantId"::UUID = current_setting('app.current_tenant_id')::UUID);
CREATE POLICY bypass_rls_policy ON "DataExtractionJob" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

ALTER TABLE "Data" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Data" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON "Data";
CREATE POLICY tenant_isolation_policy ON "Data" USING ("tenantId"::UUID = current_setting('app.current_tenant_id')::UUID);
CREATE POLICY bypass_rls_policy ON "Data" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

ALTER TABLE "NodeValue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NodeValue" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON "NodeValue";
CREATE POLICY tenant_isolation_policy ON "NodeValue" USING ("tenantId"::UUID = current_setting('app.current_tenant_id')::UUID);
CREATE POLICY bypass_rls_policy ON "NodeValue" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

ALTER TABLE "NodeValueChange" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NodeValueChange" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON "NodeValueChange";
CREATE POLICY tenant_isolation_policy ON "NodeValueChange" USING ("tenantId"::UUID = current_setting('app.current_tenant_id')::UUID);
CREATE POLICY bypass_rls_policy ON "NodeValueChange" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

ALTER TABLE "IntegrationIngestionConfiguration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "IntegrationIngestionConfiguration" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON "IntegrationIngestionConfiguration";
CREATE POLICY tenant_isolation_policy ON "IntegrationIngestionConfiguration" USING ("tenantId"::UUID = current_setting('app.current_tenant_id')::UUID);
CREATE POLICY bypass_rls_policy ON "IntegrationIngestionConfiguration" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

ALTER TABLE "IntegrationOAuthTokenSet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "IntegrationOAuthTokenSet" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON "IntegrationOAuthTokenSet";
CREATE POLICY tenant_isolation_policy ON "IntegrationOAuthTokenSet" USING ("tenantId"::UUID = current_setting('app.current_tenant_id')::UUID);
CREATE POLICY bypass_rls_policy ON "IntegrationOAuthTokenSet" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');