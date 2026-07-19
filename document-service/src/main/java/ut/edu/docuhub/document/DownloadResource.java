package ut.edu.docuhub.document;

import org.springframework.core.io.Resource;

public record DownloadResource(Resource resource, String filename, String contentType) {}
