import {
  App,
  errorMiddleware,
  flashMiddleware,
  staticFilesHandler,
} from "$app";
import { uploadWorkerHandler } from "$upload";
import ErrorPage from "./components/pages/error/ErrorPage.tsx";
import deleteAccount from "./handlers/account/delete.ts";
import logout from "./handlers/account/logout.ts";
import passkeyDelete from "./handlers/account/passkey_delete.ts";
import passkeyRename from "./handlers/account/passkey_rename.ts";
import account from "./handlers/account/show.tsx";
import mime from "./handlers/admin/mime.tsx";
import adminSettings from "./handlers/admin/settings.tsx";
import showAdmin from "./handlers/admin/show.tsx";
import listAdminUsers from "./handlers/admin/users/list_users.tsx";
import adminUser from "./handlers/admin/users/user.tsx";
import chatConnection from "./handlers/chat/connection.ts";
import chatLazyLoad from "./handlers/chat/lazy_load.tsx";
import chatSubs from "./handlers/chat/subs.ts";
import toggleChat from "./handlers/chat/toggle_chat.ts";
import changeAcl from "./handlers/inodes/acl/change_acl.ts";
import getAclPreview from "./handlers/inodes/acl/get_acl_preview.ts";
import createDirNode from "./handlers/inodes/create_dir.ts";
import deleteInodes from "./handlers/inodes/delete.ts";
import getFile from "./handlers/inodes/get_file.ts";
import listenPostProcessing from "./handlers/inodes/listen_post_proc.ts";
import showDir from "./handlers/inodes/show_dir.tsx";
import showFile from "./handlers/inodes/show_file.tsx";
import completeUpload from "./handlers/inodes/upload/complete.ts";
import initiateUpload from "./handlers/inodes/upload/initiate.ts";
import videoPlaylist from "./handlers/inodes/video_playlist.ts";
import manifestJson from "./handlers/manifest_json.ts";
import contact from "./handlers/pages/contact.tsx";
import about from "./handlers/pages/help.tsx";
import home from "./handlers/pages/home.tsx";
import privacy from "./handlers/pages/privacy.tsx";
import signUp from "./handlers/pages/sign_up.tsx";
import terms from "./handlers/pages/terms.tsx";
import createPaymentIntent from "./handlers/payment/create_intent.ts";
import listenPaymentCreated from "./handlers/payment/listen_payment_created.ts";
import subscribers from "./handlers/push_sub/subscribers.ts";
import vapid from "./handlers/push_sub/vapid.ts";
import credCreatOpt from "./handlers/webauthn/credential_creation_options.ts";
import credCreatVer from "./handlers/webauthn/credential_creation_verify.ts";
import credReqOpt from "./handlers/webauthn/credential_request_options.ts";
import credReqVer from "./handlers/webauthn/credential_request_verify.ts";
import awsWebhook from "./handlers/webhooks/aws.ts";
import { csrfMiddleware } from "./middleware/csrf.tsx";
import { headersMiddleware } from "./middleware/headers.ts";
import { sessionMiddleware } from "./middleware/session.ts";
import { stateMiddleware } from "./middleware/state.ts";
import { IS_LOCAL_DEV } from "./util/consts.ts";
import fetchAaguid from "./util/kv/cron/fetch_aaguid.ts";
import { kv } from "./util/kv/kv.ts";
import { queueHandler } from "./util/kv/queue/queue_handler.ts";

const app = new App();

app.use(csrfMiddleware);
app.use(errorMiddleware(ErrorPage));
app.use(headersMiddleware);
app.use(sessionMiddleware);
app.use(stateMiddleware);
app.use(flashMiddleware);

app.get("/", home);
app.get("/terms", terms);
app.get("/privacy", privacy);
app.get("/contact", contact);
app.get("/about", about);
app.get("/signup", signUp);
app.post("/logout", logout);
app.get("/account", account);
app.delete("/account", deleteAccount);

app.get("/assets/manifest.json", manifestJson);
app.get("/assets/upload_worker.js", uploadWorkerHandler);
app.get("/assets/*", staticFilesHandler);

app.post("/auth/credential-creation-options", credCreatOpt);
app.post("/auth/credential-creation-verify", credCreatVer);
app.post("/auth/credential-request-options", credReqOpt);
app.post("/auth/credential-request-verify", credReqVer);
app.post("/auth/passkey-delete", passkeyDelete);
app.post("/auth/passkey-rename", passkeyRename);

app.post("/inodes/dirs", createDirNode);
app.post("/inodes/delete", deleteInodes);
app.post("/inodes/upload/initiate", initiateUpload);
app.post("/inodes/upload/complete", completeUpload);
app.get("/inodes/video-playlist/:inodeId/:renditionIndex", videoPlaylist);
app.post("/inodes/acl", changeAcl);
app.get("/inodes/acl-preview/:inodeId", getAclPreview);
app.get("/inodes/listen-post-processing/:inodeId", listenPostProcessing);
app.get("/download/:inodeId", getFile);

app.get("/chat/lazy-load/:chatId", chatLazyLoad);
app.get("/chat/connection/:chatId", chatConnection);
app.post("/chat/toggle", toggleChat);
app.all("/chat/subs", chatSubs);

app.post("/push-subs/subscribers", subscribers);
app.get("/push-subs/vapid", vapid);

app.post("/webhooks/aws", awsWebhook);

app.post("/payment/intent", createPaymentIntent);
app.get("/payment/listen-created/:paymentIntentId", listenPaymentCreated);

app.get("/admin", showAdmin);
app.on(["GET", "POST"], "/admin/settings", adminSettings);
app.get("/admin/users", listAdminUsers);
app.on(["GET", "POST"], "/admin/users/:userId", adminUser);
app.get("/admin/mime", mime);

app.get("*/", showDir);
app.get("*", showFile);

let serveOpt;

if (IS_LOCAL_DEV) {
  serveOpt = {
    port: 8000,
    key: await Deno.readTextFile("util/cert/localhost-key.pem"),
    cert: await Deno.readTextFile("util/cert/localhost.pem"),
  };
}

app.serve(serveOpt);

kv.listenQueue(queueHandler);

Deno.cron("Fetch passkeys AAGUID", "0 2 * * 1", fetchAaguid);
