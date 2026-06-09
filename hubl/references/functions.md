# HubL Functions — Complete Reference

All function signatures sourced from the HubSpot VSCode extension's API-generated snippets (`hubspot-cms-vscode/snippets/auto_gen/hubl_functions.json`).

---

## Blog

| Function | Signature | Description |
|---|---|---|
| `blog_all_posts_url` | `blog_all_posts_url(selected_blog)` | Full URL to the listing page for all posts |
| `blog_author_url` | `blog_author_url(selected_blog, author_slug)` | URL to an author's listing page |
| `blog_authors` | `blog_authors(selected_blog, limit)` | Sequence of author objects, sorted by slug asc |
| `blog_by_id` | `blog_by_id(id)` | Blog object by ID or `'default'` |
| `blog_page_link` | `blog_page_link(page)` | Absolute URL of a paginated listing page |
| `blog_popular_posts` | `blog_popular_posts(selected_blog, limit, tag_slug?, time_frame?, logical_operator?)` | Posts sorted by popularity; cached 6 hours. `time_frame`: `popular_all_time`, `popular_past_year`, `popular_past_six_months`, `popular_past_month`. `tag_slug` can be a list; `logical_operator`: `AND`/`OR` |
| `blog_post_archive_url` | `blog_post_archive_url(selected_blog, year, month?, day?)` | URL to archive listing page for a date |
| `blog_post_by_id` | `blog_post_by_id(blog_post_id)` | Single blog post object by ID |
| `blog_recent_author_posts` | `blog_recent_author_posts(selected_blog, author_slug, limit)` | Posts by a specific author, most recent first (max 200) |
| `blog_recent_posts` | `blog_recent_posts(selected_blog, limit)` | Posts sorted most recent first (max 200) |
| `blog_recent_tag_posts` | `blog_recent_tag_posts(selected_blog, tag_slug, limit, logical_operator?)` | Posts by tag, most recent first. `tag_slug` can be list + `AND`/`OR` |
| `blog_tag_url` | `blog_tag_url(selected_blog, tag_slug)` | URL to a tag's listing page |
| `blog_tags` | `blog_tags(selected_blog, limit)` | Up to 250 most-used tags, sorted by post count |
| `blog_total_post_count` | `blog_total_post_count(selected_blog)` | Total published post count |

---

## CRM Objects

| Function | Signature | Description |
|---|---|---|
| `crm_associations` | `crm_associations(id, association_category, association_definition_id, query?, properties?, formatting?)` | Associated objects from a given object ID. `association_category`: `HUBSPOT_DEFINED`, `USER_DEFINED`, `INTEGRATOR_DEFINED`. See HubSpot Associations API for definition IDs |
| `crm_object` | `crm_object(object_type, query_or_id, properties?, formatting?)` | Single CRM object by HQL query or object instance ID |
| `crm_objects` | `crm_objects(object_type, query_or_ids?, properties?, formatting?)` | List of CRM objects. Paginate with `limit=N&offset=N` in query |
| `crm_property_definition` | `crm_property_definition(object_type, property_name)` | Property definition (label, type, options) for one property |
| `crm_property_definitions` | `crm_property_definitions(object_type, property_name?)` | Definitions for multiple (or all) properties on an object type |

**HQL filter operators:** `eq` (default), `neq`, `lt`, `lte`, `gt`, `gte`, `is_null`, `not_null`, `in`, `not_in`, `contains` (multi-value properties only).

**Security:** On public pages, only `product` and portal-specific custom objects are accessible. All other built-in objects require password or Membership protection.

---

## Content & Pages

| Function | Signature | Description |
|---|---|---|
| `content_by_id` | `content_by_id(id)` | Landing page, website page, or blog post by ID |
| `content_by_ids` | `content_by_ids(ids)` | Dict of content objects for a list of IDs (max 100) |
| `page_by_id` | `page_by_id(page_id)` | Landing or website page by ID |
| `blog_post_by_id` | `blog_post_by_id(blog_post_id)` | Blog post by ID |
| `topic_cluster_by_content_id` | `topic_cluster_by_content_id(content_id)` | Topic cluster associated with a piece of content |
| `flag_content_for_access_check` | `flag_content_for_access_check(id)` | Mark content ID for membership access check |

---

## Files

| Function | Signature | Description |
|---|---|---|
| `file_by_id` | `file_by_id(file_id)` | File metadata by File Manager ID |
| `files_by_ids` | `files_by_ids(file_ids)` | Metadata for a list of file IDs |

---

## Images & Media

| Function | Signature | Description |
|---|---|---|
| `resize_image_url` | `resize_image_url(url, width?, height?, length?, upscale?, upsize?)` | Rewrite a HubSpot-hosted image URL to resize on request. `length` sets the largest side. `upscale`/`upsize` control scaling beyond original dimensions |
| `video_thumbnail` | `video_thumbnail(request)` | Overlay a play button on a HubSpot-hosted image. Request: `{url, width?, height?, color?, scale?}` (scale 0.1–1.0, default 0.5) |
| `video_metadata_by_player_id` | `video_metadata_by_player_id(request)` | Metadata for a HubSpot video. Request: `{id, domain?}`. Only works for videos with sharing/embedding enabled |
| `script_embed` | `script_embed(type, src, title?, options?, description?)` | Embeddable object (Wistia, Embedly) that renders differently in editor vs live |
| `oembed` | `oembed(request)` | OEmbed data dict. Request: `{url, max_width?, max_height?}`. **Email templates only** |

---

## Colors

| Function | Signature | Description |
|---|---|---|
| `color_variant` | `color_variant(base_color, brightness_offset)` | Lighten (positive) or darken (negative) a hex color. Returns new hex |
| `color_contrast` | `color_contrast(color1, color2, wcag_rating)` | Returns `true` if the color pair passes the given WCAG rating (`"AA"` or `"AAA"`) |

---

## Dates & Times

| Function | Signature | Description |
|---|---|---|
| `today` | `today()` | Start-of-day timestamp in the portal's timezone |
| `now` | `now()` (via `unixtimestamp()`) | Current Unix timestamp |
| `to_local_time` | `to_local_time(date)` | Convert a Unix timestamp to the portal's local timezone |
| `strtodate` | `strtodate(dateString, dateFormat)` | Parse a date string into a date object (Java `SimpleDateFormat` patterns) |
| `strtotime` | `strtotime(datetimeString, datetimeFormat)` | Parse a datetime string into a datetime object |

**Date format patterns (Java `SimpleDateFormat`):** `yyyy` year · `MM` month · `dd` day · `HH` 24h hour · `hh` 12h hour · `mm` minute · `ss` second · `a` AM/PM · `MMMM` full month name · `EEE` short weekday.

---

## Geo

| Function | Signature | Description |
|---|---|---|
| `geo_distance` | `geo_distance(point1, point2_lat, point2_long, units)` | Ellipsoidal distance between two points. `units`: `FT`, `MI`, `M`, `KM`. `point1` is a HubDB location column value |
| `postal_location` | `postal_location(postal_code, country_code?)` | Returns `{lat, lon, city, state, ...}` for a postal code. **Limit: 1 call per email render** |

---

## Assets & URLs

| Function | Signature | Description |
|---|---|---|
| `get_asset_url` | `get_asset_url(path)` | Public URL for a Design Manager file |
| `get_public_template_url` | `get_public_template_url(path)` | Public URL for a template by path |
| `get_public_template_url_by_id` | `get_public_template_url_by_id(template_id)` | Public URL for a template by numeric ID |
| `module_asset_url` | `module_asset_url(name)` | URL for an asset attached to a module |
| `include_css` | `include_css(path)` | Generates a `<link>` tag for a Design Manager CSS file |
| `include_javascript` | `include_javascript(path)` | Generates a `<script>` tag for a Design Manager JS file |
| `require_css` | `require_css(url, render_options?)` | Enqueue a CSS URL into `<head>`. Options: `async` (bool), plus any HTML attributes |
| `require_js` | `require_js(url, render_options?)` | Enqueue a JS URL. Options: `position` (`head`/`footer`), `defer`, `async`, plus HTML attributes |
| `head_css` | `head_css()` | Output all enqueued CSS as HTML |
| `head_js` | `head_js()` | Output all enqueued `<head>` JS as HTML |
| `footer_js` | `footer_js()` | Output all footer-enqueued JS as HTML |
| `head_elements` | `head_elements()` | Output all additional `<head>` elements |
| `get_rss_url` | `get_rss_url(attributes)` | URL for an RSS listing. Dict keys match `rss_listing` tag params |
| `sign_postlisting_url` | `sign_postlisting_url(blog_id, list_type, max_links, tag_name?)` | Signed URL for a post listing |

---

## Personalization

| Function | Signature | Description |
|---|---|---|
| `personalization_token` | `personalization_token(expression, default?)` | Value of a contact/company property (server-side, non-cached contexts) |
| `personalization_api_url` | `personalization_api_url(contact_properties, company_properties?)` | Generates a signed URL for the client-side Personalization API. Changes to requested properties require a new URL |
| `data_token` | `data_token(expression, default?, options?)` | Value of any data in the rendering context |

---

## Ecommerce

| Function | Signature | Description |
|---|---|---|
| `product_recommendations` | `product_recommendations(store_id, limit, currency?, min_price?, max_price?, enable_price_formatting?)` | Most popular products based on deal appearances. `store_id`: portal store ID, `'all'`, or `'HS'` |

---

## Navigation & Menus

| Function | Signature | Description |
|---|---|---|
| `menu` | `menu(menu_id_or_name, root_type?, root_key?)` | Nested link structure of an advanced menu. `root_type`: `site_root`, `top_parent`, `parent`, `page_name`, `page_id`, `breadcrumb` |
| `follow_me_links` | `follow_me_links()` | List of configured follow-me social links for the portal |
| `facebook_messenger_link` | `facebook_messenger_link()` | m.me link for Facebook Messenger |

---

## CTAs

| Function | Signature | Description |
|---|---|---|
| `cta` | `cta(guid, align_opt?)` | Renders a CTA embed tag. `align_opt`: `justifyleft`, `justifycenter`, `justifyright`, `justifyfull` |
| `display_call_to_action` | `display_call_to_action(id)` | Returns the JS needed to display a CTA |

---

## i18n / Localization

| Function | Signature | Description |
|---|---|---|
| `i18n_getlanguage` | `i18n_getlanguage()` | Language code of the current page. Works within modules only |
| `i18n_getmessage` | `i18n_getmessage(message_name, substitutions?)` | Translated message for the page language. Works within modules only |
| `load_translations` | `load_translations(path, language_code, language_code_fallback?)` | Load a `_locales` translation map from a Design Manager path |
| `locale_name` | `locale_name(language_code, target_language_code?)` | Human-readable language name, optionally translated into another language |

---

## Formatting

| Function | Signature | Description |
|---|---|---|
| `format_name` | `format_name(firstName, surname, useHonorificIfApplicable?)` | Formats a name; adds Japanese honorifics when context language is Japanese |
| `format_company_name` | `format_company_name(name, useHonorificIfApplicable?)` | Formats a company name with Japanese honorifics where appropriate |
| `format_address` | `format_address(locale, fullAddress)` | Formats an address object per locale. `fullAddress`: `{address, address2?, city, state, country, zip}` |

---

## Utility

| Function | Signature | Description |
|---|---|---|
| `range` | `range(start?, end, step?)` | Arithmetic sequence of integers. 1 arg: `0..n`. 2 args: `start..end`. 3 args: with step. Max 1000 values |
| `namespace` | `namespace(dictionary?, **kwargs)` | Mutable namespace object. Use to update variables inside `for` loops (unlike `set`, which is block-scoped) |
| `unique_string` | `unique_string(string)` | Distinctive string derived from the input; useful for generating stable IDs |
| `set_response_code` | `set_response_code(code)` | Set HTTP response code. Currently only `404` is supported |
| `type` | `type(value)` | Returns the type name of a value |
| `truncate` | `truncate(string, length, killwords?, end?)` | Truncate a string (also available as the `\| truncate` filter) |
| `super` | `super()` | Inside a `{% block %}`: renders the parent block's content |
| `get_theme_breakpoint_styles` | `get_theme_breakpoint_styles()` | Breakpoint name → `{media_query, styles}` mapping for the active theme |
| `get_module_breakpoint_styles` | `get_module_breakpoint_styles()` | Breakpoint styles for the current module |
| `get_asset_version` | `get_asset_version()` | Asset version identifier |
| `include_custom_fonts` | `include_custom_fonts()` | Outputs custom font `<link>` tags configured in the portal |
