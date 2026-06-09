---
name: hubspot-cms-membership
description: "Build password-protected member areas on HubSpot CMS — gating content, CRM-personalized pages, login flows, and membership templates"
compatibility: "Content Hub Enterprise only"
license: MIT
metadata:
    author: georgestephanis
    version: "1.0"
    written: "2026-06-09"
    written_against:
        hubspot-cli: "7.10"
        content-hub: "Enterprise"
---

## When to use

Use this skill when:
- Building a customer portal, partner area, or member-only content section
- Gating blog posts, resource downloads, or event registrations behind login
- Personalizing CMS pages with CRM contact/company/deal data for logged-in users
- Implementing a user login/registration flow within HubSpot CMS

**Content Hub Enterprise** is required. The Membership feature is not available on lower tiers.

## Inputs required

- HubSpot account with Content Hub Enterprise
- HubSpot CLI installed and authenticated (see `hubspot-cms-local-dev`)
- A defined contact list in HubSpot (Membership groups contacts who can access gated content)
- Templates to gate (existing or new page/blog templates)
- Design for: login page, registration page, password reset flow

## Procedure

### 1. Enable Membership in HubSpot

1. Go to **Settings → CMS → Membership**
2. Enable the Membership feature for your domain
3. Set the **Login page** — the page contacts land on when they hit gated content unauthenticated
4. Set the **Registration page** (optional — if self-registration is allowed)
5. Set the **Logout redirect** — where contacts go after logging out

### 2. Create a membership access group

Membership access is controlled by **Contact Lists** in HubSpot:

1. Go to **Contacts → Lists**
2. Create a static or active list of contacts who should have access
3. In Membership settings, create an **Access Group** and link it to this list

Contacts in the list can log in; contacts not in the list cannot access gated content even with a login.

### 3. Gate a page or blog post

**Gate a page:**
1. Open the page in the CMS editor
2. Go to **Settings → Advanced → Restrict access**
3. Select **Membership** and choose the Access Group

**Gate an entire blog:**
1. Go to **Settings → Website → Blog → [Blog name]**
2. Enable **Restrict to members** and assign an Access Group

**Gate a folder of pages:**
- Apply access restriction to a HubSpot page group — all pages in the group inherit the restriction

### 4. Build a login template

Create `templates/membership-login.html` in your theme:

```html
<!--
  templateType: membership_login
  label: "Member Login"
  isAvailableForNewContent: false
-->
{% extends "./base.html" %}

{% block body %}
<main class="membership-login">
  <div class="login-container">
    <h1>Member Login</h1>

    {# HubSpot renders the login form at this tag #}
    {% membership_login_form %}

    <p>
      <a href="{{ membership.reset_password_url }}">Forgot your password?</a>
    </p>
  </div>
</main>
{% endblock %}
```

Key membership HubL tags:
- `{% membership_login_form %}` — renders the login form (email + password)
- `{% membership_registration_form %}` — renders the self-registration form
- `{% membership_reset_password_form %}` — renders the password reset form

### 5. Build a registration template

```html
<!--
  templateType: membership_register
  label: "Member Registration"
  isAvailableForNewContent: false
-->
{% extends "./base.html" %}

{% block body %}
<main class="membership-register">
  <h1>Create Your Account</h1>
  {% membership_registration_form %}
</main>
{% endblock %}
```

### 6. Personalize content for logged-in contacts

When a contact is logged in, their CRM data is available via the `contact` variable:

```html
{# Check if a contact is logged in #}
{% if contact %}
  <p>Welcome back, {{ contact.firstname }}!</p>

  {# Access any contact property #}
  <p>Your account: {{ contact.email }}</p>
  <p>Company: {{ contact.company }}</p>
  <p>Lifecycle stage: {{ contact.lifecyclestage }}</p>

  {# Access custom contact properties #}
  <p>Member since: {{ contact.membership_start_date }}</p>
{% else %}
  <p><a href="{{ membership.login_url }}">Log in</a> to see your personalized content.</p>
{% endif %}
```

**Available `contact` properties** — any property defined on the Contact object in HubSpot is accessible by its internal property name. Common ones:

| Variable | Property |
|---|---|
| `contact.firstname` | First name |
| `contact.lastname` | Last name |
| `contact.email` | Email address |
| `contact.company` | Company name |
| `contact.phone` | Phone number |
| `contact.lifecyclestage` | Lifecycle stage |
| `contact.hs_calculated_form_submissions` | Form submission count |

### 7. Display company and deal data for logged-in contacts

```html
{% if contact %}
  {# Fetch associated company data #}
  {% set company = crm_associations(contact.hs_object_id, "CONTACT_TO_COMPANY", 1) %}
  {% if company %}
    <p>Organization: {{ company.name }}</p>
    <p>Industry: {{ company.industry }}</p>
  {% endif %}

  {# Fetch open deals for the contact #}
  {% set deals = crm_associations(contact.hs_object_id, "CONTACT_TO_DEAL") %}
  {% if deals %}
    <h2>Your Open Opportunities</h2>
    {% for deal in deals %}
      <div class="deal-card">
        <h3>{{ deal.dealname }}</h3>
        <p>Stage: {{ deal.dealstage }}</p>
        <p>Amount: {{ deal.amount | money }}</p>
      </div>
    {% endfor %}
  {% endif %}
{% endif %}
```

### 8. Logout link

```html
<a href="{{ membership.logout_url }}">Log out</a>
```

HubSpot provides `membership.logout_url`, `membership.login_url`, and `membership.registration_url` as built-in variables available on all membership-enabled templates.

### 9. Membership emails

HubSpot automatically sends membership system emails for:
- Welcome / account confirmation
- Password reset
- Access invitation

Customize these at **Settings → Email → System emails → Membership**. Use standard email template format with `{{ contact.firstname }}` personalization tokens.

### 10. Access control for modules

You can conditionally render module content based on membership status:

```html
{# In module.html — show premium content only to members #}
{% if contact %}
  {{ module.premium_content }}
  <a href="{{ module.download_url }}">Download Resource</a>
{% else %}
  <div class="gate-prompt">
    <p>{{ module.teaser_text }}</p>
    <a href="{{ membership.login_url }}" class="btn">Log in to access</a>
    <a href="{{ membership.registration_url }}" class="btn btn--secondary">Register free</a>
  </div>
{% endif %}
```

## Verification

- Navigating to a gated page while unauthenticated redirects to the login template
- Logging in with a contact in the access group list grants access
- `{{ contact.firstname }}` renders the logged-in contact's name on personalized pages
- Contacts not in the access group list are redirected even after login
- Logout link clears the session and redirects to the configured logout URL

## Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| "Membership not available" error | Account not on Content Hub Enterprise | Upgrade subscription or confirm with account admin |
| Login redirects in a loop | Login page itself is set as restricted | Do not apply membership restriction to the login template page |
| `contact` variable is null after login | Contact not in any access group list | Add the contact to the list linked to the access group |
| `{% membership_login_form %}` renders blank | Template type not set to `membership_login` | Set the correct `templateType` annotation and re-upload |
| Personalization shows wrong data | Contact lookup using old cached session | HubSpot sessions are cookie-based; test in incognito window |
| Password reset emails not arriving | System email template missing or unconfigured | Check Settings → Email → System emails → Membership |

## Escalation

- For gating logic in modules (vs. full pages), add conditional `{% if contact %}` blocks in `module.html`.
- For complex access rules beyond list membership, consider using contact properties + active lists as access groups.
- For custom login UIs beyond the standard forms, the `{% membership_login_form %}` tag cannot be replaced with a custom form — escalate to HubSpot support for options.
- See also: `hubspot-cms-templates` for template type reference, `hubl` for CRM variable syntax.
- [Membership docs](https://developers.hubspot.com/docs/cms/features/membership)
