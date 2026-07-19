package ut.edu.docuhub.common.events;

/** Tên exchange và routing key cho các event nghiệp vụ trên RabbitMQ. */
public final class EventTopics {

    private EventTopics() {}

    public static final String EXCHANGE = "docuhub.events";

    public static final String DOCUMENT_UPLOADED = "document.uploaded";
    public static final String DOCUMENT_DELETED = "document.deleted";
    public static final String USER_DELETED = "user.deleted";
}
