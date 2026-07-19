package ut.edu.docuhub.messaging;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import ut.edu.docuhub.common.events.EventTopics;

/** Queue riêng của chat-service trên exchange chung docuhub.events. */
@Configuration
public class ChatAmqpConfig {

    public static final String DOCUMENT_UPLOADED_QUEUE = "q.chat-service.document-uploaded";
    public static final String DOCUMENT_DELETED_QUEUE = "q.chat-service.document-deleted";
    public static final String USER_DELETED_QUEUE = "q.chat-service.user-deleted";

    @Bean
    public Queue chatDocumentUploadedQueue() {
        return QueueBuilder.durable(DOCUMENT_UPLOADED_QUEUE).build();
    }

    @Bean
    public Queue chatDocumentDeletedQueue() {
        return QueueBuilder.durable(DOCUMENT_DELETED_QUEUE).build();
    }

    @Bean
    public Queue chatUserDeletedQueue() {
        return QueueBuilder.durable(USER_DELETED_QUEUE).build();
    }

    @Bean
    public Binding chatDocumentUploadedBinding(Queue chatDocumentUploadedQueue,
                                               TopicExchange docuhubEventsExchange) {
        return BindingBuilder.bind(chatDocumentUploadedQueue)
                .to(docuhubEventsExchange)
                .with(EventTopics.DOCUMENT_UPLOADED);
    }

    @Bean
    public Binding chatDocumentDeletedBinding(Queue chatDocumentDeletedQueue,
                                              TopicExchange docuhubEventsExchange) {
        return BindingBuilder.bind(chatDocumentDeletedQueue)
                .to(docuhubEventsExchange)
                .with(EventTopics.DOCUMENT_DELETED);
    }

    @Bean
    public Binding chatUserDeletedBinding(Queue chatUserDeletedQueue,
                                          TopicExchange docuhubEventsExchange) {
        return BindingBuilder.bind(chatUserDeletedQueue)
                .to(docuhubEventsExchange)
                .with(EventTopics.USER_DELETED);
    }
}
