---
name: hubspot-cms-membership
description: "Build password-protected member areas on HubSpot CMS — access groups, all four system templates, CRM contact personalisation, and conditional content gating"
compatibility: "Content Hub Enterprise only; CLI v8+"
license: MIT
metadata:
    author: georgestephanis
    version: "1.2"
    written: "2026-09-21"
    written_against:
        hubspot-cli: "8.15.0"
        content-hub: "Enterprise"
---

## When to use

Use this skill when:
- Building a customer portal, partner area, or member-only content section
- Gating individual pages, blog posts, or entire site sections behind login
- Personalising CMS content with logged-in contact's CRM properties (name, company, deals, custom fields)
- Implementing a full self-serve login/register/password-reset flow within HubSpot CMS

**Content Hub Enterprise is required.** Membership is not available on Starter or Professional.

## Inputs required

- HubSpot account with Content Hub Enterprise
- HubSpot CLI installed and authenticated — see `hubspot-cli`
- A theme with a base layout — see `hubspot-cms-themes`
- A HubSpot contact list for each access tier (used to define who can view gated content)
- Decision: **invite-only** (admin adds contacts to list manually) vs. **self-registration** (contacts create their own accounts)

## Procedure

### 1. Enable Membership in HubSpot settings

1. Go to **Settings → CMS → Membership**
2. Enable Membership for your domain
3. Assign the four system page templates (created in step 3 below):
   - Login page
   - Registration page (if self-registration is enabled)
   - Password reset request page
   - Password reset page
4. Set the **Logout redirect URL** — where contacts land after logging out

### 2. Create access groups

Access groups map a HubSpot contact list to a set of gated pages.

1. Go to **Settings → CMS → Membership → Access Groups**
2. Click **Create access group**
3. Give it a name (e.g. "Customers", "Partners", "Premium Members")
4. Select the **Contact list** that defines who has access — this can be an active list with enrollment criteria (e.g. `Lifecycle Stage = Customer`) or a static list managed manually

Contacts in the list have access; contacts not in the list are redirected to the login page even after logging in.

### 3. Build the four system templates

All membership templates should remove the site header and footer to prevent distraction on system flows. Note the correct `templateType` value for each — these are exact strings HubSpot requires.

**Login template (`templateType: membership_login_page`)**

```html
<!--
  templateType: membership_login_page
  isAvailableForNewContent: true
  label: Membership - Login
  screenshotPath: ../../images/template-previews/membership-login.png
-->
{% set template_css = "../../css/templates/system.css" %}
{% set pageTitle = "Membership | Login" %}
{% extends "../layouts/base.html" %}

{% block header %}{% endblock %}

{% block body %}
<section class="content-wrapper">
  <div class="systems-page">
    {% module "intro"
      path="@hubspot/rich_text",
      html="<h1>Sign in to view this page</h1><p>This page is only available to authorised users.</p>"
    %}
    <div class="form-container">
      {% member_login "login_form"
        email_label="Email",
        password_label="Password",
        remember_me_label="Remember Me",
        reset_password_text="Forgot your password?",
        submit_button_text="Login"
      %}
    </div>
    <div>
      {% module_block module "admin_contact"
        label="Contact admin"
        path="@hubspot/rich_text"
      %}
        {% module_attribute "html" %}
          <p>Having trouble?
            <a href="{{ ("mailto:" ~ site_settings.membershipWebsiteAdmin)|escape_url }}">
              Contact the admin
            </a>.
          </p>
        {% end_module_attribute %}
      {% end_module_block %}
    </div>
  </div>
</section>
{% endblock %}
```

**Registration template (`templateType: membership_register_page`)**

```html
<!--
  templateType: membership_register_page
  isAvailableForNewContent: true
  label: Membership - Register
-->
{% set pageTitle = "Membership | Register" %}
{% extends "../layouts/base.html" %}

{% block header %}{% endblock %}

{% block body %}
<section class="content-wrapper">
  <div class="systems-page">
    {% module "intro"
      path="@hubspot/rich_text",
      html="<h1>Welcome!</h1><p>Set up your password to access your account.</p>"
    %}
    <div class="form-container">
      {% member_register "register_form"
        email_label="Email",
        password_label="Password",
        password_confirm_label="Confirm Password",
        submit_button_text="Save Password"
      %}
    </div>
  </div>
</section>
{% endblock %}
```

**Password reset request template (`templateType: membership_reset_request_page`)**

```html
<!--
  templateType: membership_reset_request_page
  isAvailableForNewContent: true
  label: Membership - Reset Password Request
-->
{% set pageTitle = "Membership | Reset password" %}
{% extends "../layouts/base.html" %}

{% block header %}{% endblock %}

{% block body %}
<section class="content-wrapper">
  <div class="systems-page">
    {% module "intro"
      path="@hubspot/rich_text",
      html="<h1>Reset your password</h1><p>Enter the email address for your account.</p>"
    %}
    <div class="form-container">
      {% password_reset_request "reset_request_form"
        email_label="Email",
        submit_button_text="Send Reset Email"
      %}
    </div>
  </div>
</section>
{% endblock %}
```

**Password reset template (`templateType: membership_reset_page`)**

```html
<!--
  templateType: membership_reset_page
  isAvailableForNewContent: true
  label: Membership - Reset Password
-->
{% set pageTitle = "Membership | Reset password" %}
{% extends "../layouts/base.html" %}

{% block header %}{% endblock %}

{% block body %}
<section class="content-wrapper">
  <div class="systems-page">
    {% module "intro"
      path="@hubspot/rich_text",
      html="<h1>Choose a new password</h1>"
    %}
    <div class="form-container">
      {% password_reset "reset_form"
        password_label="New Password",
        password_confirm_label="Confirm Password",
        submit_button_text="Save Password"
      %}
    </div>
  </div>
</section>
{% endblock %}
```

**Template type reference:**

| Template purpose | `templateType` value |
|---|---|
| Login | `membership_login_page` |
| Register | `membership_register_page` |
| Reset password (request email) | `membership_reset_request_page` |
| Reset password (set new password) | `membership_reset_page` |

### 4. Gate a page or blog post

**Single page:** open the page editor → Settings → Advanced → Restrict access → Membership → select the Access Group

**Entire blog:** Settings → Website → Blog → [Blog name] → Restrict to members → select Access Group

**Page group/folder:** apply restriction at the page group level — all pages in the group inherit it automatically

### 5. Personalise content for logged-in contacts

When a contact is logged in, their CRM properties are available via the `contact` variable anywhere in a template or module:

```html
{# Check if a contact is logged in #}
{% if contact %}
  <p>Welcome back, {{ contact.firstname|escape_html }}!</p>

  {# Any contact property by internal name #}
  <p>Your email: {{ contact.email|escape_html }}</p>
  <p>Company: {{ contact.company|escape_html }}</p>
  <p>Lifecycle stage: {{ contact.lifecyclestage|escape_html }}</p>

  {# Custom properties #}
  <p>Member tier: {{ contact.member_tier|escape_html }}</p>

  <a href="/members/dashboard">Go to your dashboard</a>
  <a href="{{ site_settings.membershipLogoutUrl }}">Log out</a>
{% else %}
  <p>
    <a href="{{ site_settings.membershipLoginUrl }}">Log in</a>
    to see your personalised content.
  </p>
{% endif %}
```

**Commonly used `contact` properties:**

| Variable | Property |
|---|---|
| `contact.firstname` | First name |
| `contact.lastname` | Last name |
| `contact.email` | Email address |
| `contact.company` | Company name |
| `contact.jobtitle` | Job title |
| `contact.phone` | Phone number |
| `contact.lifecyclestage` | Lifecycle stage |
| `contact.hs_object_id` | Contact's HubSpot record ID |

Any property defined on the Contact object in HubSpot is accessible using its **internal name** (the snake_case identifier shown in Contact property settings).

### 6. Display associated company and deal data

```html
{% if contact %}
  {# Fetch associated company (returns first associated company) #}
  {% set company = crm_associations(contact.hs_object_id, "CONTACT_TO_COMPANY", 1)|first %}
  {% if company %}
    <p>Organisation: {{ company.name|escape_html }}</p>
    <p>Industry: {{ company.industry|escape_html }}</p>
  {% endif %}

  {# Fetch open deals for this contact #}
  {% set deals = crm_associations(contact.hs_object_id, "CONTACT_TO_DEAL") %}
  {% if deals %}
    <h2>Your Open Opportunities</h2>
    {% for deal in deals %}
      <div class="deal-card">
        <h3>{{ deal.dealname|escape_html }}</h3>
        <p>Stage: {{ deal.dealstage|escape_html }}</p>
        {% if deal.amount %}
          <p>Value: {{ deal.amount|money }}</p>
        {% endif %}
      </div>
    {% endfor %}
  {% endif %}
{% endif %}
```

### 7. Conditional gating within a module

For soft gating — show a teaser to non-members and full content to members — add `{% if contact %}` logic in `module.html`:

```html
{# module.html for a gated resource module #}
{% if contact %}
  <div class="resource resource--unlocked">
    <h2>{{ module.title }}</h2>
    {{ module.full_content }}
    <a href="{{ module.download_url }}" class="btn">Download</a>
  </div>
{% else %}
  <div class="resource resource--locked">
    <h2>{{ module.title }}</h2>
    <p>{{ module.teaser_text }}</p>
    <a href="{{ site_settings.membershipLoginUrl }}" class="btn">
      Log in to access
    </a>
    {% if site_settings.membershipRegistrationUrl %}
      <a href="{{ site_settings.membershipRegistrationUrl }}" class="btn btn--secondary">
        Register free
      </a>
    {% endif %}
  </div>
{% endif %}
```

### 8. Membership site settings variables

These are available on any page in a Membership-enabled domain:

| Variable | Value |
|---|---|
| `site_settings.membershipLoginUrl` | URL of the login page |
| `site_settings.membershipLogoutUrl` | URL that logs the user out |
| `site_settings.membershipRegistrationUrl` | URL of the registration page (if enabled) |
| `site_settings.membershipWebsiteAdmin` | Admin email address configured in Membership settings |

### 9. Membership system emails

HubSpot automatically sends transactional emails for:
- Welcome / account confirmation (sent after registration)
- Password reset (sent after reset request)
- Invitation (sent when a contact is added to an access list)

Customise at **Settings → Email → System emails → Membership**. Use standard email template format. Available personalisation tokens include `{{ contact.firstname }}`, `{{ contact.email }}`, and the magic login link token.

## Verification

- Visiting a gated page while logged out redirects to the login template
- Logging in with a contact in the access group list grants access to the gated page
- Logging in with a contact NOT in the access group is rejected (redirected back to login)
- `{{ contact.firstname }}` renders the logged-in contact's name on personalised pages
- Logout URL clears the session and redirects to the configured logout redirect
- Password reset request sends an email to the contact's address
- Registration template sends a welcome email after successful account creation

## Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| Membership options not in page settings | Account not on Content Hub Enterprise | Verify subscription |
| Login redirects in an infinite loop | Login page itself is set as restricted | Never restrict the membership system templates |
| `contact` is null after login | Contact not in any access group list | Add the contact to the list linked to the access group |
| `{% member_login %}` renders blank | Wrong `templateType` annotation | Template must use `membership_login_page` exactly |
| `{% member_register %}` not shown | Registration not enabled in Membership settings | Enable self-registration in **Settings → CMS → Membership** |
| Password reset emails not arriving | System email template not configured | Go to Settings → Email → System emails → Membership |
| `site_settings.membershipLoginUrl` is empty | Membership not enabled for this domain | Enable Membership and assign the login page in Settings |

## Escalation

- The `{% member_login %}` and related tags cannot be replaced with custom HTML forms — they render HubSpot's authentication forms. No workaround exists for completely custom login UI.
- For complex access tier logic (e.g. "show different content to Gold vs. Silver members"), use `contact.member_tier` (a custom property) with `{% if %}` branching in templates/modules.
- For React CMS projects with membership, the `contact` variable is available in HubL templates but not directly in React components — pass it via a module field or read it from a serverless function.
- See also: `hubspot-cms-templates` (template type reference), `hubl` (CRM variable syntax), `hubspot-cms-membership` system email templates.
- Reference: [cms-theme-boilerplate membership templates](https://github.com/HubSpot/cms-theme-boilerplate/tree/main/src/templates/system), [Membership docs](https://developers.hubspot.com/docs/guides/cms/overview)
