export interface NotificationPayload {
    fcmToken: string;
    body: string;
    title: string;
    device_type: string
}
export interface messageBody {
    notification: notificationBody;
    token: string;
}
interface notificationBody{
    title: string;
    body: string;
}