package com.workboard.entry;

import com.workboard.tag.TagEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "entry_tag")
public class EntryTagEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "INTEGER")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entry_id", nullable = false)
    private EntryEntity entry;

    @Column(nullable = false, length = 50)
    private String tag;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tag_id")
    private TagEntity tagEntity;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public EntryEntity getEntry() { return entry; }
    public void setEntry(EntryEntity entry) { this.entry = entry; }
    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }
    public TagEntity getTagEntity() { return tagEntity; }
    public void setTagEntity(TagEntity tagEntity) { this.tagEntity = tagEntity; }
}
