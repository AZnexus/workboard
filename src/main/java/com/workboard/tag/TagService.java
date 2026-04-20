package com.workboard.tag;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TagService {

    private final TagRepository tagRepository;

    public TagService(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @Transactional(readOnly = true)
    public List<TagEntity> findAll() {
        return tagRepository.findAll();
    }

    @Transactional(readOnly = true)
    public TagEntity findById(Long id) {
        return tagRepository.findById(id)
                .orElseThrow(() -> new TagNotFoundException(id));
    }

    @Transactional
    public TagEntity create(CreateTagRequest request) {
        tagRepository.findByName(request.name()).ifPresent(existing -> {
            throw new IllegalArgumentException("Tag already exists: " + request.name());
        });
        TagEntity entity = new TagEntity();
        entity.setName(request.name());
        entity.setColor(request.color());
        return tagRepository.save(entity);
    }

    @Transactional
    public TagEntity update(Long id, UpdateTagRequest request) {
        TagEntity entity = findById(id);
        if (request.name() != null) entity.setName(request.name());
        if (request.color() != null) entity.setColor(request.color());
        return tagRepository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        TagEntity entity = findById(id);
        tagRepository.delete(entity);
    }
}
