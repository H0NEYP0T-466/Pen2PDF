# 📐 LaTeX Formula Rendering Guide

## Overview

Pen2PDF supports LaTeX mathematical notation in both the Notes Generator and manual document features. This guide explains how to write formulas that will render beautifully in your exported PDFs.

## LaTeX Delimiters

### Inline Math
Use single dollar signs `$...$` for inline formulas that appear within text:

```markdown
The transformation function $s = T(r)$ converts input to output.
```

**Renders as:** The transformation function *s = T(r)* converts input to output.

### Display Math
Use double dollar signs `$$...$$` for display equations on their own line:

```markdown
$$s = c \cdot \log(1+r)$$
```

**Renders as:** A centered equation on its own line.

## Common LaTeX Syntax

### Basic Operations

| Operation | LaTeX Syntax | Example |
|-----------|--------------|---------|
| Multiplication | `\cdot` | `$a \cdot b$` → a·b |
| Division (fraction) | `\frac{num}{den}` | `$\frac{a}{b}$` → a/b |
| Superscript | `^` | `$x^2$` → x² |
| Subscript | `_` | `$x_i$` → xᵢ |

### Greek Letters

| Letter | LaTeX | Example |
|--------|-------|---------|
| Alpha | `\alpha` | `$\alpha$` → α |
| Beta | `\beta` | `$\beta$` → β |
| Gamma | `\gamma` | `$\gamma$` → γ |
| Theta | `\theta` | `$\theta$` → θ |
| Lambda | `\lambda` | `$\lambda$` → λ |

### Advanced Operators

| Operation | LaTeX Syntax | Example |
|-----------|--------------|---------|
| Integral | `\int` | `$\int_0^r f(x)dx$` |
| Summation | `\sum` | `$\sum_{i=1}^{n} x_i$` |
| Square Root | `\sqrt{}` | `$\sqrt{x}$` |
| Partial Derivative | `\partial` | `$\frac{\partial f}{\partial x}$` |

## Complete Examples

### Image Processing Formulas

```markdown
## ➕ Formulas/Definitions

• **Spatial Domain Transformation**: $g(x,y)=T[f(x,y)]$ (slide#4)
• **Point Processing**: $s = T(r)$ (slide#6)
• **Image Negative**: $s = L - 1 - r$ (slide#10)
• **Log Transformation**: $s = c \cdot \log(1+r)$ (slide#11)
• **Power-Law (Gamma)**: $s = c \cdot r^\gamma$ (slide#13)
• **Contrast Stretching**: $s = \frac{r - r_{min}}{r_{max} - r_{min}} \times (L-1)$ (slide#25)

### Display Equations

Histogram Equalization (Continuous):
$$s = T(r) = (L-1) \int_0^r p_r(w)dw$$

Histogram Equalization (Discrete):
$$s_k = T(r_k) = (L-1) \sum_{j=0}^{k} p_r(r_j) = \frac{L-1}{MN} \sum_{j=0}^{k} n_j$$
```

### Statistics Formulas

```markdown
• **Mean**: $\mu = \frac{1}{n}\sum_{i=1}^{n} x_i$
• **Variance**: $\sigma^2 = \frac{1}{n}\sum_{i=1}^{n} (x_i - \mu)^2$
• **Standard Deviation**: $\sigma = \sqrt{\sigma^2}$
• **Normal Distribution**: $f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}$
```

### Physics Formulas

```markdown
• **Kinetic Energy**: $E_k = \frac{1}{2}mv^2$
• **Newton's Second Law**: $F = ma$
• **Einstein's Mass-Energy**: $E = mc^2$
• **Wave Equation**: $v = f\lambda$
```

## Best Practices

### ✅ DO:
- Always wrap formulas in LaTeX delimiters (`$` or `$$`)
- Use `\cdot` for multiplication dots
- Use `\frac{}{}` for fractions
- Use proper Greek letter commands (`\alpha`, `\beta`, etc.)
- Keep complex formulas on display lines with `$$`
- Test your LaTeX syntax before exporting

### ❌ DON'T:
- Write formulas as plain text (e.g., `s = T(r)` without `$`)
- Use asterisk `*` for multiplication (use `\cdot` or just concatenate)
- Forget to escape special characters with backslash
- Mix inline and display delimiters incorrectly

## AI-Generated Notes

When using the Notes Generator feature, the AI is instructed to:
1. Automatically format all mathematical formulas as proper LaTeX
2. Use inline math `$...$` for formulas in bullet points
3. Use display math `$$...$$` for important standalone equations
4. Include proper syntax for all mathematical operations

The generated notes will have LaTeX formulas that render correctly in PDF exports.

## Troubleshooting

### Formulas appear as raw LaTeX text
**Cause:** Missing or incorrect delimiters  
**Solution:** Ensure all formulas are wrapped in `$...$` or `$$...$$`

### Formulas look broken or incomplete
**Cause:** Syntax error in LaTeX  
**Solution:** Check for matching braces `{}`, correct command names, and proper escaping

### Greek letters show as text
**Cause:** Missing backslash before letter name  
**Solution:** Use `\alpha` not `alpha`

### PDF export shows garbled math
**Cause:** KaTeX CSS or fonts not loading  
**Solution:** This should be fixed in the latest version. If issues persist, try re-exporting.

## Technical Details

Pen2PDF uses the following technologies for LaTeX rendering:

- **marked**: Markdown parser
- **marked-katex-extension**: LaTeX syntax detection and parsing
- **KaTeX**: Fast math typesetting library
- **html2pdf.js**: PDF generation with proper font embedding

The system is configured with:
- `throwOnError: false` - Gracefully handles syntax errors
- `output: 'html'` - Renders to HTML for PDF conversion
- `nonStandard: true` - Parses formulas even without spaces around `$`
- `useCORS: true` - Allows loading KaTeX fonts from CDN

## Resources

- [KaTeX Documentation](https://katex.org/docs/supported.html) - Complete list of supported functions
- [LaTeX Math Symbols](https://www.cmor-faculty.rice.edu/~heinken/latex/symbols.pdf) - Comprehensive symbol reference
- [Detexify](http://detexify.kirelabs.org/classify.html) - Draw a symbol to find its LaTeX command

---

**Need help?** Check the [README](README.md) or open an issue on GitHub.
