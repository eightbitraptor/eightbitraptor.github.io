---
layout: page
title: Posts
---

<ul class="index-list">
  <% collections.posts.resources.each do |post| %>
    <li>
      <a href="<%= post.relative_url %>"><%= post.data.title %></a>
      <span><%= date_to_long_string(post.data.date) %></span>
    </li>
  <% end %>
</ul>
