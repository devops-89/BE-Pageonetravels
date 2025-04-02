import { LOGO } from '../constants/commonConstants';

export const paymentSuccessTicketFailureTemplate = (bookingId: string) => {
    return `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
    <title>Flight Booking Update</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            box-sizing: border-box;
        }
        body {
            margin: 0;
            padding: 0;
        }
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
        }
        #MessageViewBody a {
            color: inherit;
            text-decoration: none;
        }
        p {
            line-height: inherit;
        }
        .desktop_hide,
        .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
        }
        .image_block img+div {
            display: none;
        }
        .highlight {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            margin: 15px 0;
        }
        @media (max-width:520px) {
            .desktop_hide table.icons-inner {
                display: inline-block !important;
            }
            .icons-inner {
                text-align: center;
            }
            .icons-inner td {
                margin: 0 auto;
            }
            .mobile_hide {
                display: none;
            }
            .row-content {
                width: 100% !important;
            }
            .stack .column {
                width: 100%;
                display: block;
            }
            .mobile_hide {
                min-height: 0;
                max-height: 0;
                max-width: 0;
                overflow: hidden;
                font-size: 0px;
            }
            .desktop_hide,
            .desktop_hide table {
                display: table !important;
                max-height: none !important;
            }
        }
    </style>
</head>
<body style="background-color: #FFFFFF; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
    <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #FFFFFF;">
        <tbody>
            <tr>
                <td>
                    <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 500px; margin: 0 auto;" width="500">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="font-weight: 400; text-align: left; mso-table-lspace: 0pt; mso-table-rspace: 0pt; padding-bottom: 5px; padding-top: 5px; vertical-align: top;">
                                                    <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                <div class="alignment" align="center" style="line-height:10px">
                                                                    <div style="max-width: 225px;"><img src="${LOGO}" style="display: block; height: auto; border: 0; width: 100%;" width="225" height="auto"></div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; width: 500px; margin: 0 auto;" width="500">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="font-weight: 400; text-align: left; mso-table-lspace: 0pt; mso-table-rspace: 0pt; padding-bottom: 5px; padding-top: 5px; vertical-align: top;">
                                                    <table class="heading_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <td class="pad">
                                                                <h1 style="margin: 0; color: #1e0e4b; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 20px; font-weight: 700; text-align: left;">
                                                                    Flight Booking Update
                                                                </h1>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; width: 500px; margin: 0 auto;" width="500">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="font-weight: 400; text-align: left; mso-table-lspace: 0pt; mso-table-rspace: 0pt; padding-bottom: 5px; padding-top: 5px; vertical-align: top;">
                                                    <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <td class="pad">
                                                                <div style="font-family: sans-serif;">
                                                                    <div class="txtTinyMce-wrapper" style="font-size: 14px; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color: #333333; line-height: 1.4; text-align: left;">
                                                                        <p style="margin: 0; margin-bottom: 15px;">Dear Customer,</p>
                                                                        <p style="margin: 0; margin-bottom: 15px;">We would like to inform you that while your payment for Order ID <strong>${bookingId}</strong> has been successfully processed, we encountered an issue while issuing your flight ticket.</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; width: 500px; margin: 0 auto;" width="500">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="font-weight: 400; text-align: left; mso-table-lspace: 0pt; mso-table-rspace: 0pt; padding-bottom: 5px; padding-top: 5px; vertical-align: top;">
                                                    <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <td class="pad">
                                                                <div style="font-family: sans-serif;">
                                                                    <div class="highlight txtTinyMce-wrapper" style="font-size: 14px; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color: #333333; line-height: 1.4; text-align: left;">
                                                                        <p style="margin: 0;"><strong>Important:</strong> Your final settlement is in progress and will be completed within the next few business days.</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-5" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; width: 500px; margin: 0 auto;" width="500">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="font-weight: 400; text-align: left; mso-table-lspace: 0pt; mso-table-rspace: 0pt; padding-bottom: 5px; padding-top: 5px; vertical-align: top;">
                                                    <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <td class="pad">
                                                                <div style="font-family: sans-serif;">
                                                                    <div class="txtTinyMce-wrapper" style="font-size: 14px; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color: #333333; line-height: 1.4; text-align: left;">
                                                                        <p style="margin: 0; margin-bottom: 10px;">Please note:</p>
                                                                        <ul style="margin: 0; padding-left: 20px;">
                                                                            <li style="margin-bottom: 8px;">Your payment has been successfully received</li>
                                                                            <li style="margin-bottom: 8px;">We are working to resolve the ticket issuance issue</li>
                                                                            <li style="margin-bottom: 8px;">You will receive another update within 3-5 business days</li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-6" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; width: 500px; margin: 0 auto;" width="500">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="font-weight: 400; text-align: left; mso-table-lspace: 0pt; mso-table-rspace: 0pt; padding-bottom: 5px; padding-top: 5px; vertical-align: top;">
                                                    <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <td class="pad">
                                                                <div style="font-family: sans-serif;">
                                                                    <div class="txtTinyMce-wrapper" style="font-size: 14px; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color: #333333; line-height: 1.4; text-align: left;">
                                                                        <p style="margin: 0;">We sincerely apologize for this inconvenience and appreciate your patience.</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-7" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; width: 500px; margin: 0 auto;" width="500">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="font-weight: 400; text-align: left; mso-table-lspace: 0pt; mso-table-rspace: 0pt; padding-bottom: 5px; padding-top: 5px; vertical-align: top;">
                                                    <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <td class="pad">
                                                                <div style="font-family: sans-serif;">
                                                                    <div class="txtTinyMce-wrapper" style="font-size: 12px; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color: #777777; line-height: 1.4; text-align: left; border-top: 1px solid #eeeeee; padding-top: 15px;">
                                                                        <p style="margin: 0;">If you have any questions, please contact our support team at support@page1travel.com</p>
                                                                        <p style="margin: 0; margin-top: 10px;">© ${new Date().getFullYear()} Page1 Travel. All rights reserved.</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
</body>
</html>`;
};