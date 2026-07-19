package ut.edu.docuhub.messaging;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import ut.edu.docuhub.common.events.EventTopics;

/** Queue riêng của document-service trên exchange chung docuhub.events. */
@Configuration
public class DocumentAmqpConfig {

    public static final String USER_DELETED_QUEUE = "q.document-service.user-deleted";

    @Bean
    public Queue documentUserDeletedQueue() {
        return QueueBuilder.durable(USER_DELETED_QUEUE).build();
    }

    @Bean
    public Binding documentUserDeletedBinding(Queue documentUserDeletedQueue,
                                              TopicExchange docuhubEventsExchange) {
        return BindingBuilder.bind(documentUserDeletedQueue)
                .to(docuhubEventsExchange)
                .with(EventTopics.USER_DELETED);
    }
}
