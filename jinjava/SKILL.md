---
name: jinjava
description: "Use HubSpot's Jinjava library — a Java-based Jinja2-compatible template engine — to render templates programmatically in JVM applications. Use when integrating Jinjava into a Java/Kotlin project, writing or debugging Jinja-style templates in Java, or extending Jinjava with custom tags, filters, functions, or expression tests."
compatibility: "Java 8+ (use 2.0.11-java7 for Java 7). Maven Central artifact: com.hubspot.jinjava:jinjava."
license: MIT
metadata:
    author: georgestephanis
    version: "1.0"
    written: "2026-06-09"
    written_against:
        jinjava: "2.x"
---

## When to use

- Adding Jinja-style templating to a Java/Kotlin application
- Rendering customer-created free-form templates safely (unknown/untrusted content)
- Debugging template errors with line-number reporting
- Extending the engine with custom tags, filters, functions, or expression tests
- Porting HubSpot CMS (HubL) templates into a standalone Java service

---

## Inputs required

- Maven or Gradle project (Java 8+)
- Template strings (or a resource locator that can load them)
- A `Map<String, Object>` context containing the variables the template expects
- (For extensions) Java classes implementing `Tag`, `Filter`, `ExpTest`, or static methods for `ELFunctionDefinition`

---

## Procedure

### 1. Add the dependency

**Maven:**
```xml
<dependency>
  <groupId>com.hubspot.jinjava</groupId>
  <artifactId>jinjava</artifactId>
  <version>LATEST_VERSION</version>
</dependency>
```

**Gradle:**
```groovy
implementation 'com.hubspot.jinjava:jinjava:LATEST_VERSION'
```

Check [CHANGES.md](https://github.com/HubSpot/jinjava/blob/master/CHANGES.md) for the current release version.

---

### 2. Render a template

```java
Jinjava jinjava = new Jinjava();
Map<String, Object> context = new HashMap<>();
context.put("name", "Alice");

String template = "Hello, {{ name }}!";
String result = jinjava.render(template, context);
// → "Hello, Alice!"
```

**Template syntax:**
| Construct | Syntax |
|---|---|
| Variable output | `{{ variable }}` |
| Tag / control | `{% tag %}` |
| Filter | `{{ value \| filter_name }}` |
| Comment | `{# comment #}` |
| Whitespace trim | `{%- tag -%}` |

---

### 3. Capture errors (recommended for user templates)

Use `renderForResult()` instead of `render()` — it never throws; errors include line numbers:

```java
RenderResult result = jinjava.renderForResult(template, context);
String output = result.getOutput();
List<TemplateError> errors = result.getErrors();
for (TemplateError err : errors) {
    System.out.println("Line " + err.getLineno() + ": " + err.getMessage());
}
```

`TemplateError.ErrorType` values: `SYNTAX_ERROR`, `UNKNOWN_TAG`, `UNKNOWN_FILTER`, `UNKNOWN_VARIABLE`, etc.

---

### 4. Configure the engine

```java
JinjavaConfig config = JinjavaConfig.builder()
    .withMaxRenderDepth(10)          // max include/extends recursion depth
    .withMaxStringLength(1_000_000)  // output string size cap
    .withNestedInterpretationEnabled(true) // allow nested {{ }} in strings
    .withTrimBlocks(false)           // strip newline after block tags (like Jinja2 trim_blocks)
    .withLstripBlocks(false)         // strip leading whitespace before block tags
    .withEnableRecursiveMacroCalls(false)
    .withFailOnUnknownTokens(false)  // false = silently skip unknowns (safer for user templates)
    .build();

Jinjava jinjava = new Jinjava(config);
```

---

### 5. Configure resource loading

Default is `ClasspathResourceLocator` (loads from classpath). Override for custom template storage:

```java
jinjava.setResourceLocator(new MyCustomResourceLocator());
```

For multiple loaders (tried in order):
```java
jinjava.setResourceLocator(
    new CascadingResourceLocator(new MyCustomResourceLocator(), new ClasspathResourceLocator())
);
```

> **Security:** `FileResourceLocator` was removed as a default to close a path-traversal hole. Only add it explicitly if templates are fully trusted — never with user-controlled `{% include %}` paths.

Templates use `{% include "path/to/file.html" %}` and `{% extends "base.html" %}` to reference loaded resources.

---

### 6. Extend with custom tags

Implement `com.hubspot.jinjava.lib.tag.Tag`:

```java
public class TimestampTag implements Tag {
    @Override public String getName() { return "timestamp"; }
    @Override public String getEndTagName() { return null; } // null = self-closing
    @Override public boolean isRenderedInValidationMode() { return false; }

    @Override
    public String interpret(TagNode tagNode, JinjavaInterpreter interpreter) {
        return String.valueOf(System.currentTimeMillis());
    }
}

jinjava.getGlobalContext().registerTag(new TimestampTag());
// Template: {% timestamp %}
```

Block tags (with body) return `getEndTagName()` as a non-null string (e.g. `"endtimestamp"`). Access inner content via `tagNode.renderChildren(interpreter)`.

---

### 7. Extend with custom filters

Implement `com.hubspot.jinjava.lib.filter.Filter`:

```java
public class ConcatFilter implements Filter {
    @Override public String getName() { return "concat"; }

    @Override
    public Object filter(Object var, JinjavaInterpreter interpreter, String... args) {
        return var.toString() + (args.length > 0 ? args[0] : "");
    }
}

jinjava.getGlobalContext().registerFilter(new ConcatFilter());
// Template: {{ "hello" | concat(" world") }}  → "hello world"
```

---

### 8. Extend with custom functions

Map a public static Java method to a namespaced template function via `ELFunctionDefinition`:

```java
public class MathFunctions {
    public static double square(double x) { return x * x; }
}

jinjava.getGlobalContext().registerFunction(
    new ELFunctionDefinition("math", "square", MathFunctions.class, "square", double.class)
);
// Template: {{ math:square(4) }}  → 16.0
```

For non-static (injected) instances, use `InjectedContextFunctionProxy` to wrap them.

---

### 9. Extend with custom expression tests

Implement `com.hubspot.jinjava.el.ext.AbstractCallableMethod` (or the `ExpTest` interface):

```java
public class IsEvenTest implements ExpTest {
    @Override public String getName() { return "even"; }

    @Override
    public boolean evaluate(Object value, JinjavaInterpreter interpreter, String... args) {
        return ((Number) value).longValue() % 2 == 0;
    }
}

jinjava.getGlobalContext().registerExpTest(new IsEvenTest());
// Template: {% if 4 is even %}yes{% endif %}
```

---

## Verification

- `jinjava.render(template, context)` returns a non-empty string without throwing
- `renderForResult(...).getErrors()` is empty (or contains only expected warnings)
- Custom tags/filters appear in `jinjava.getGlobalContext()` after registration
- Templates using `{% include %}` resolve correctly against the configured `ResourceLocator`

---

## Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| `TemplateError` with `UNKNOWN_VARIABLE` | Variable not in context map | Add key to context before rendering |
| `TemplateError` with `UNKNOWN_TAG` | Tag not registered | Register custom tag or check spelling |
| `TemplateError` with `SYNTAX_ERROR` | Mismatched tag delimiters | Check `{% %}` / `{{ }}` pairs and nesting |
| `ResourceNotFoundException` on include/extends | ResourceLocator can't find path | Check locator order in `CascadingResourceLocator` |
| Infinite recursion / stack overflow | Circular `{% include %}` or `{% extends %}` | Set `withMaxRenderDepth()` in config |
| Output truncated | `maxStringLength` cap hit | Raise `withMaxStringLength()` or reduce template output |
| FileResourceLocator path traversal | User controls `{% include %}` path | Remove `FileResourceLocator`; use a path-allowlist locator |
| `ClassCastException` in custom filter | `var` type assumption wrong | Check `var instanceof` before casting |

---

## Escalation

- Source and latest release: https://github.com/HubSpot/jinjava
- Changelog (version numbers): https://github.com/HubSpot/jinjava/blob/master/CHANGES.md
- Original announcement post: https://product.hubspot.com/blog/jinjava-a-jinja-for-your-java
- For HubL (HubSpot CMS template syntax built on top of Jinjava), see the `hubl` skill
- For HubSpot CMS template development, see the `hubl` skill — HubL adds CMS-specific tags, filters, and variables on top of the Jinjava engine
