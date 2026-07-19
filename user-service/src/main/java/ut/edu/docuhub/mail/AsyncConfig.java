package ut.edu.docuhub.mail;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/** Bật @Async để gửi email không chặn request. */
@Configuration
@EnableAsync
public class AsyncConfig {
}
