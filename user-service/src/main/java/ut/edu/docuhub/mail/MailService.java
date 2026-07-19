package ut.edu.docuhub.mail;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/** Gửi email cho user-service (hiện tại chỉ có email đặt lại mật khẩu). */
@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender mailSender;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Gửi email chứa link đặt lại mật khẩu.
     * Chạy bất đồng bộ để không chặn request; mọi lỗi gửi mail chỉ log,
     * tuyệt đối không ném ra ngoài (tránh lộ thông tin email có tồn tại hay không).
     */
    @Async
    public void sendResetPasswordEmail(String to, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setTo(to);
            helper.setSubject("DocuHub — Đặt lại mật khẩu");
            helper.setText(buildHtml(resetLink), true);
            mailSender.send(message);
            log.info("Đã gửi email đặt lại mật khẩu tới {}", to);
        } catch (Exception ex) {
            log.error("Gửi email đặt lại mật khẩu tới {} thất bại", to, ex);
        }
    }

    private String buildHtml(String resetLink) {
        return """
                <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
                  <h2 style="color: #111827; margin-top: 0;">Đặt lại mật khẩu DocuHub</h2>
                  <p style="color: #374151;">Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu cho tài khoản DocuHub của bạn.</p>
                  <p style="text-align: center; margin: 32px 0;">
                    <a href="%s" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Đặt lại mật khẩu</a>
                  </p>
                  <p style="color: #374151;">Nếu nút trên không hoạt động, hãy dán liên kết sau vào trình duyệt:<br>
                    <a href="%s" style="color: #2563eb; word-break: break-all;">%s</a>
                  </p>
                  <p style="color: #6b7280; font-size: 13px;">Liên kết có hiệu lực trong 60 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
                </div>
                """.formatted(resetLink, resetLink, resetLink);
    }
}
