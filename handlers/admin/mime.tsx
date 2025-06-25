import AdminPage from "../../components/pages/AdminPage.tsx";
import { withAdmin } from "../../util/admin/with_admin_handler.ts";
import { listMimeTypes } from "../../util/kv/upload_stats.ts";
import { MIME_CONF } from "../../util/mime/mime_conf.ts";

export default withAdmin(async () => {
  const mimeTypes = await listMimeTypes();
  return (
    <AdminPage title="Mime Types">
      <table class="basic">
        <thead>
          <tr>
            <th>Count</th>
            <th>Name</th>
            <th>Conf.</th>
          </tr>
        </thead>
        {mimeTypes.map(({ name, count }) => (
          <tr>
            <td>{count}</td>
            <td>{name}</td>
            <td>{MIME_CONF[name] ? "✓" : "❌"}</td>
          </tr>
        ))}
      </table>
    </AdminPage>
  );
});
