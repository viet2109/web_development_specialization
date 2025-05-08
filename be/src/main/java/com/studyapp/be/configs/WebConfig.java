package com.studyapp.be.configs;

import com.studyapp.be.dto.response.LinkPreviewDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.Duration;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("#{'${app.allowed-origins}'.split(',')}")
    private List<String> allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(allowedOrigins.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Bean
    public RedisTemplate<String, LinkPreviewDTO> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, LinkPreviewDTO> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        Jackson2JsonRedisSerializer<LinkPreviewDTO> serializer = new Jackson2JsonRedisSerializer<>(LinkPreviewDTO.class);
        template.setValueSerializer(serializer);
        return template;
    }

    @Bean
    public HashOperations<String, String, LinkPreviewDTO> hashOperations(
            RedisTemplate<String, LinkPreviewDTO> redisTemplate) {
        return redisTemplate.opsForHash();
    }
}
