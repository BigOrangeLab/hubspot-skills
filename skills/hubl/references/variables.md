# HubL Variables — Complete Reference

Variables sourced from the HubSpot VSCode extension's manually-curated snippets (`hubspot-cms-vscode/snippets/man_gen/`).

---

## Global variables (all template types)

| Variable | Description |
|---|---|
| `hub_id` | Portal ID of the HubSpot account |
| `portal_id` | Alias for `hub_id` |
| `content_id` | Unique ID for the current page, post, or email. Alias for `content.id` |
| `year` | Current year (integer) |
| `local_dt` | Datetime object in the portal's timezone. **Disables page caching — use JS for cacheable current-time needs** |
| `local_time_zone` | Timezone string from HubSpot Report Settings (e.g. `"America/New_York"`) |
| `company_domain` | Company domain from Website > Pages > Branding > Logo Link |
| `favicon_link` | Source URL of the favicon (set in Settings > Website > Pages > Branding) |
| `request_contact` | Dict of data about the currently identified contact (requires cookie) |

---

## `content` object (pages, posts, emails)

| Variable | Description |
|---|---|
| `content.name` | Internal name for pages/emails; post title for blog posts. Includes editable wrapper on blog posts — use `page_meta.name` for plain text |
| `content.absolute_url` | Full public URL |
| `content.meta_description` | Meta description. Prefer `page_meta.meta_description` for `<meta>` tags |
| `content.template_path` | Design Manager path to the template (e.g. `custom/page/web_page_basic/my_template.html`) |
| `content.publish_date` | Datetime object (UTC) of when content was published |
| `content.publish_date_localized` | Localized publish date string, formatted per blog date format settings |
| `content.created` | Datetime object (UTC) of original creation |
| `content.updated` | Datetime object (UTC) of last user update |
| `content.author_name` | First + last name of the content creator |
| `content.author_email` | Email of the content creator |
| `content.author_username` | HubSpot username of the content creator |
| `content.campaign` | GUID of the associated marketing campaign |
| `content.campaign_name` | Name of the associated marketing campaign |
| `content.archived` | `true` if the content is archived |
| `content.widgets` | Dict of all static modules on the page, keyed by module name |

Access module values directly: `{{ content.widgets.my_module_name.body.value }}`

---

## `page_meta` object

Prefer these over `content.*` equivalents for `<head>` tags:

| Variable | Description |
|---|---|
| `page_meta.html_title` | Page title — use in `<title>` tag |
| `page_meta.meta_description` | Meta description — use in `<meta name="description">` |
| `page_meta.canonical_url` | Canonical URL (no query string). HubSpot auto-canonicalizes; use this for `<link rel="canonical">` |
| `page_meta.name` | Alias for `content.name` (no editable wrapper) |

---

## `request` object

| Variable | Description |
|---|---|
| `request.domain` | Domain used to access this page |
| `request.path` | Path component of the URL |
| `request.path_and_query` | Path + query string |
| `request.query` | Raw query string |
| `request.query_dict` | Query string as a `name → value` dict |
| `request.full_url` | Full URL used to access this page |
| `request.scheme` | Protocol: `http` or `https` |
| `request.referrer` | HTTP referrer (page that linked here) |
| `request.remote_ip` | Visitor IP address |
| `request.search_engine` | Search engine used to find this page (e.g. `google`, `yahoo`) |
| `request.search_keyword` | Keyword phrase used to find this page |
| `request.cookies` | Dict of cookie name → value |
| `request.headers` | Dict of available request headers |

---

## Blog templates

### Post / listing context

| Variable | Description |
|---|---|
| `group` | The blog object for the current blog |
| `group.id` | Blog ID |
| `group.absolute_url` | Blog root URL |
| `group.name` | Blog name |
| `contents` | Sequence of post objects on listing pages |
| `content.tag_list` | List of tag objects on a post (`tag.name`, `tag.slug`) |
| `content.blog_post_author` | Author object (`display_name`, `slug`, `email`, `avatar`, `bio`) |
| `content.post_body` | Full HTML body of the post |
| `content.post_summary` | Summary/excerpt of the post |
| `content.featured_image` | Featured image URL |
| `content.featured_image_alt_text` | Alt text for the featured image |
| `content.blog_publish_instant` | Unix timestamp of publish date |
| `archive_list_page` | `true` if the current page is a date-archive listing |

### Loop variables (in `for post in contents`)

For posts retrieved via `blog_recent_posts()` etc., the loop variable exposes the same `content.*` properties. Use the loop item name instead of `content` — e.g. `post.name`, `post.absolute_url`, `post.tag_list`.

---

## Email templates (Marketing Hub)

### Content variables

| Variable | Description |
|---|---|
| `content.subject` | Email subject line |
| `content.from_name` | Sender display name |
| `content.reply_to` | Reply-to address |
| `content.email_body` | Main rich text body module |
| `content.emailbody_plaintext` | Optional plain text body override |
| `content.create_page` | `true` if a web version of the email exists |

### Unsubscribe & compliance (required by CAN-SPAM)

| Variable | Description |
|---|---|
| `unsubscribe_section` | Renders a full unsubscribe block with link and help text |
| `unsubscribe_anchor` | Just the `<a>` tag linking to the unsubscribe page |
| `unsubscribe_link_all` | Link to unsubscribe from **all** email communications |
| `subscription_confirmation_url` | URL of the subscription preferences confirmation page |
| `subscription_name` | Name of the Email Type for this email |
| `view_as_page_url` | Link to the web version of this email |
| `view_as_page_section` | Web-version link with help text |

### Style variables (aliases for `site_settings.*`)

Configured in Settings > Marketing > Email > Configuration:

| Variable | Description |
|---|---|
| `email_body_width` | Email body width (e.g. `"600px"`) |
| `email_body_padding` | Email body padding |
| `background_color` | Background color |
| `body_color` | Body background color |
| `body_border_color` | Border color |
| `body_border_color_choice` | `BORDER_AUTOMATIC` / `BORDER_MANUAL` / `BORDER_NONE` |
| `email_body_border_css` | Generated inline border CSS |
| `primary_font` | Primary font family |
| `primary_font_color` | Primary font color |
| `primary_font_size` | Primary font size (with `px`) |
| `primary_font_size_num` | Primary font size as a number only (no `px`) |
| `primary_accent_color` | Primary accent color |
| `secondary_font` | Secondary font family |
| `secondary_font_color` | Secondary font color |
| `secondary_font_size_num` | Secondary font size (number only) |
| `secondary_accent_color` | Secondary accent color |

### Company footer variables

| Variable | Description |
|---|---|
| `site_settings.office_location_name` | Office location name |
| `site_settings.company_street_address_2` | Address line 2 |

---

## `site_settings` object (pages + emails)

`site_settings` exposes portal-level branding settings. Commonly used properties:

| Variable | Description |
|---|---|
| `site_settings.company_name` | Company name |
| `site_settings.company_street_address_1` | Street address line 1 |
| `site_settings.company_city` | City |
| `site_settings.company_state` | State/region |
| `site_settings.company_zip` | Postal code |
| `site_settings.company_country` | Country |
| `site_settings.primary_accent_color` | Primary accent color |
| `site_settings.secondary_accent_color` | Secondary accent color |
| `site_settings.primary_font` | Primary font |
| `site_settings.primary_font_color` | Primary font color |
| `site_settings.primary_font_size` | Primary font size |

---

## HubDB dynamic pages

When a page is powered by a HubDB table (Content Hub Pro/Enterprise):

| Variable | Description |
|---|---|
| `dynamic_page_hubdb_table_id` | ID of the HubDB table driving this dynamic page |
| `dynamic_page_route_level` | Nesting depth of the current route |
| `row` | The current HubDB row object. Access columns as `row.column_name` |
| `row.hs_id` | Row's internal HubSpot ID |
| `row.hs_path` | Row's URL path segment |
| `row.hs_name` | Row's display name |

---

## CRM object dynamic pages

When a page is powered by a CRM object:

| Variable | Description |
|---|---|
| `crm_object` | The CRM object driving the current dynamic page |
| `dynamic_page_crm_object_type_fqn` | Fully-qualified type name of the CRM object |

---

## Module / widget data

| Variable | Description |
|---|---|
| `widget_data` | Dict of module values exposed via `export_to_template_context=True`. Keys are module names |
| `widget_data.module_name.body.value` | Value of a standard HubL tag field |
| `widget_data.module_name.src` | `src` of an image module field |
| `widget_data.module_name.field_name` | Named field of a custom module |

`export_to_template_context` does **not** work with drag-and-drop modules (arbitrary runtime IDs). Use static modules only.

---

## Preview / editor variables

| Variable | Description |
|---|---|
| `is_in_editor` | `true` when the page is being previewed in the CMS editor |
| `domain_settings` | Domain-level settings for the current domain |
