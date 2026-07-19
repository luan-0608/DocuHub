package ut.edu.docuhub.common.messaging;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import ut.edu.docuhub.common.events.EventTopics;

/**
 * Cấu hình RabbitMQ chung cho mọi service: exchange topic + JSON converter
 * (Spring Boot tự áp MessageConverter bean cho RabbitTemplate và listener).
 */
@Configuration
public class CommonAmqpConfig {

    @Bean
    public TopicExchange docuhubEventsExchange() {
        return new TopicExchange(EventTopics.EXCHANGE, true, false);
    }

    @Bean
    public MessageConverter jacksonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
