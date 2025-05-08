package com.studyapp.be.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.microsoft.playwright.*;
import com.microsoft.playwright.options.WaitForSelectorState;
import com.studyapp.be.dto.response.LinkPreviewDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

@Service
@Slf4j
@RequiredArgsConstructor
public class LinkPreviewService {

    @Value("${link-preview.timeout:10000}")
    private int timeout;

    @Value("${link-preview.spa-domains}")
    private List<String> spaDomains;

    private final RedisTemplate<String, LinkPreviewDTO> redisTemplate;

    private static final Set<String> ALLOWED_SCHEMES = Set.of("http", "https");
    private static final Pattern DOMAIN_PATTERN = Pattern.compile("^[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)+$");

    public LinkPreviewDTO getLinkPreview(String url) throws URISyntaxException {
        try {
            validateUrl(url);
            LinkPreviewDTO cached = getFromCache(url);
            if (cached != null) return cached;

            return isSPA(url) ? handleSPAUrl(url) : handleStandardUrl(url);
        } catch (IOException e) {
            log.error("Lỗi truy cập URL: {}", url, e);
            return generateErrorPreview(url);
        } catch (Exception e) {
            log.error("Lỗi không xác định: {}", url, e);
            throw e;
        }
    }

    private LinkPreviewDTO generateErrorPreview(String url) {
        LinkPreviewDTO preview = new LinkPreviewDTO();
        preview.setUrl(url);
        preview.setTitle("Lỗi truy cập");
        preview.setDescription("Không thể truy cập nội dung");
        return preview;
    }

    private LinkPreviewDTO handleStandardUrl(String url) throws IOException {
        Connection connection = Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                .timeout(timeout)
                .followRedirects(true)
                .ignoreHttpErrors(true)
                .maxBodySize(0)
                .header("Accept-Language", "en-US,en;q=0.9")
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
                .referrer("https://www.google.com");

        Document doc = connection.get();
        int statusCode = connection.response().statusCode();

        if (statusCode >= 400) {
            log.warn("Truy cập URL {} trả về mã lỗi {}", url, statusCode);
        }

        LinkPreviewDTO preview = extractMetadata(doc, url);
        cacheResult(url, preview);
        return preview;
    }

    private LinkPreviewDTO handleSPAUrl(String url) throws IOException {
        try (Playwright playwright = Playwright.create()) {
            Browser browser = playwright.chromium().launch(new BrowserType.LaunchOptions()
                    .setHeadless(true)
                    .setArgs(List.of(
                            "--no-sandbox",
                            "--disable-dev-shm-usage",
                            "--disable-blink-features=AutomationControlled",
                            "--disable-infobars")));

            BrowserContext context = browser.newContext(new Browser.NewContextOptions()
                    .setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                    .setViewportSize(1280, 720));

            Page page = context.newPage();

            page.addInitScript("Object.defineProperty(navigator, 'webdriver', { get: () => false });");

            Response response = page.navigate(url, new Page.NavigateOptions().setTimeout(15000));

            if (response.status() >= 400) {
                log.warn("Truy cập SPA URL {} trả về mã lỗi {}", url, response.status());
            }

            try {
                page.waitForSelector("meta[property='og:title']", new Page.WaitForSelectorOptions()
                        .setTimeout(5000)
                        .setState(WaitForSelectorState.ATTACHED));
            } catch (PlaywrightException e) {
                log.warn("Không tìm thấy thẻ meta cho SPA URL: {}", url);
            }

            String html = page.content();
            Document doc = Jsoup.parse(html, url);
            return extractMetadata(doc, url);
        } catch (PlaywrightException e) {
            log.error("Lỗi Playwright: {}", e.getMessage());
            return handleStandardUrl(url);
        }
    }

    private LinkPreviewDTO extractMetadata(Document doc, String originalUrl) {
        LinkPreviewDTO preview = new LinkPreviewDTO();
        preview.setUrl(originalUrl);
        preview.setDomain(getDomain(originalUrl));

        preview.setTitle(getMetaTag(doc, "og:title"));
        preview.setDescription(getMetaTag(doc, "og:description"));
        preview.setImageUrl(getMetaTag(doc, "og:image"));
        preview.setSiteName(getMetaTag(doc, "og:site_name"));

        if (preview.getTitle() == null) preview.setTitle(getMetaTag(doc, "twitter:title"));
        if (preview.getDescription() == null) preview.setDescription(getMetaTag(doc, "twitter:description"));
        if (preview.getImageUrl() == null) preview.setImageUrl(getMetaTag(doc, "twitter:image"));

        if (preview.getTitle() == null) preview.setTitle(doc.title());
        if (preview.getDescription() == null) preview.setDescription(getMetaTag(doc, "description"));

        preview.setFaviconUrl(doc.select("link[rel~=icon]").attr("href"));

        doc.select("script[type='application/ld+json']").forEach(script -> {
            try {
                JsonNode json = new ObjectMapper().readTree(script.html());
                if (preview.getTitle() == null) preview.setTitle(json.at("/name").asText());
                if (preview.getDescription() == null) preview.setDescription(json.at("/description").asText());
            } catch (IOException ignored) {
            }
        });

        if (preview.getImageUrl() == null) {
            preview.setImageUrl(doc.select("meta[itemprop='image']").attr("content"));
        }


        return preview;
    }

    private String getMetaTag(Document doc, String property) {
        return doc.select("meta[property='og:" + property + "'], meta[property='twitter:" + property + "'], meta[name='" + property + "']")
                .stream()
                .findFirst()
                .map(e -> e.attr("content"))
                .orElse(null);
    }

    private void validateUrl(String url) throws URISyntaxException {
        URI uri = new URI(url);

        if (!ALLOWED_SCHEMES.contains(uri.getScheme().toLowerCase())) {
            throw new IllegalArgumentException("Invalid URL scheme");
        }

        if (!DOMAIN_PATTERN.matcher(uri.getHost()).matches()) {
            throw new IllegalArgumentException("Invalid domain format");
        }
    }

    private boolean isSPA(String url) {
        String host = getDomain(url);
        return spaDomains.stream().anyMatch(host::contains);
    }

    private String getDomain(String url) {
        try {
            return new URI(url).getHost();
        } catch (URISyntaxException e) {
            return "";
        }
    }

    private void cacheResult(String url, LinkPreviewDTO preview) {
        try {
            redisTemplate.opsForValue().set(url, preview, Duration.ofHours(24));
        } catch (Exception e) {
            log.error("Caching failed for URL: {}", url, e);
        }
    }

    private LinkPreviewDTO getFromCache(String url) {
        try {
            return redisTemplate.opsForValue().get(url);
        } catch (Exception e) {
            log.error("Cache retrieval failed for URL: {}", url, e);
            return null;
        }
    }
}
