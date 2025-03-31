ALTER TABLE "File" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "File" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "File" USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);

ALTER TABLE "UserTenantRole" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserTenantRole" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "UserTenantRole" USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);

ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Document" USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);

ALTER TABLE "Workspace" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workspace" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Workspace" USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);

ALTER TABLE "Model" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Model" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Model" USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);

ALTER TABLE "ModelVersion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ModelVersion" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "ModelVersion" USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);

ALTER TABLE "WorkspaceModel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkspaceModel" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "WorkspaceModel" USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);

ALTER TABLE "WorkspaceDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkspaceDocument" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "WorkspaceDocument" USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);

ALTER TABLE "Definition" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Definition" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Definition" USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);

ALTER TABLE "Node" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Node" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Node" USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);

ALTER TABLE "DataExtractionJob" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DataExtractionJob" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "DataExtractionJob" USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);

ALTER TABLE "Data" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Data" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Data" USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);

ALTER TABLE "NodeValue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NodeValue" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "NodeValue" USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);

ALTER TABLE "NodeValueChange" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NodeValueChange" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "NodeValueChange" USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);

ALTER TABLE "IntegrationIngestionConfiguration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "IntegrationIngestionConfiguration" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "IntegrationIngestionConfiguration" USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);

ALTER TABLE "IntegrationOAuthTokenSet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "IntegrationOAuthTokenSet" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "IntegrationOAuthTokenSet" USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);