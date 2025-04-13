# Documentation Guide

This guide provides instructions on how to work with the MkDocs documentation system used for the Medical Appointment System, including how to run the documentation server locally and how to generate PDF versions of the documentation.

## MkDocs Overview

MkDocs is a fast, simple static site generator that's designed to build project documentation. Documentation source files are written in Markdown, and configured with a single YAML configuration file (`mkdocs.yml`).

The Medical Appointment System uses MkDocs with the Material theme to create a professional and accessible documentation website.

## Setting Up MkDocs

There are two ways to set up the MkDocs environment: using Poetry (recommended) or using pip directly.

### Using Poetry (Recommended)

[Poetry](https://python-poetry.org/) is a dependency management tool for Python that makes it easy to set up and manage dependencies in a reproducible way.

#### Prerequisites

- Python 3.8 or higher
- [Poetry](https://python-poetry.org/docs/#installation) installed on your system

#### Installation

1. Clone the repository and navigate to the root directory

2. Install dependencies using Poetry:

```bash
poetry install
```

This will create a virtual environment and install all dependencies defined in the `pyproject.toml` file.

#### Using Poetry Commands

The project includes several shell script commands for common documentation tasks:

- Serve the documentation locally:

  ```bash
  ./docs.sh serve
  ```

- Build the documentation:

  ```bash
  ./docs.sh build
  ```

- Build the documentation with PDF export:

  ```bash
  ./docs.sh build-pdf
  ```

- Deploy a new version of the documentation:
  ```bash
  ./docs.sh deploy-version 1.0.0 "Initial release"
  ```

### Using pip Directly

If you prefer not to use Poetry, you can set up MkDocs directly using pip.

#### Prerequisites

- Python 3.6 or higher
- pip (Python package installer)

#### Installation

1. Install MkDocs and the Material theme:

```bash
pip install mkdocs mkdocs-material
```

2. Install additional plugins used in the documentation:

```bash
pip install pymdown-extensions mkdocs-minify-plugin
```

3. For PDF export capabilities:

```bash
pip install mkdocs-pdf-export-plugin weasyprint
```

4. For documentation versioning:

```bash
pip install mike
```

## Running MkDocs Locally

### Serving the Documentation

#### With Poetry

```bash
./docs.sh serve
```

#### Without Poetry

To serve the documentation locally and view it in your browser:

1. Navigate to the project root directory (where `mkdocs.yml` is located)
2. Run the following command:

```bash
mkdocs serve
```

3. Open your browser and go to `http://127.0.0.1:8000/`

The local server has hot-reloading enabled, so it will automatically update when you make changes to the documentation files.

### Building the Documentation

#### With Poetry

```bash
./docs.sh build
```

#### Without Poetry

To build the static site:

```bash
mkdocs build
```

This will create a `site` directory with the built HTML documentation. You can deploy this directory to any static hosting service.

## Generating PDF Documentation

MkDocs doesn't have built-in PDF generation, but you can use the `mkdocs-pdf-export-plugin` to add this functionality.

### Installing the PDF Export Plugin

#### With Poetry

The PDF export plugin is already included in the Poetry dependencies.

#### Without Poetry

```bash
pip install mkdocs-pdf-export-plugin weasyprint
```

Note: WeasyPrint has additional system dependencies that may need to be installed separately. See the [WeasyPrint installation documentation](https://doc.courtbouillon.org/weasyprint/stable/first_steps.html) for details specific to your operating system.

### Configuring PDF Export

The PDF export plugin is already configured in the `mkdocs.yml` file:

```yaml
plugins:
  - search
  - minify:
      minify_html: true
  - pdf-export:
      combined: true
      combined_output_path: pdf/medical-appointment-system-documentation.pdf
      enabled_if_env: ENABLE_PDF_EXPORT
```

### Generating the PDF

#### With Poetry

```bash
./docs.sh build-pdf
```

#### Without Poetry

```bash
ENABLE_PDF_EXPORT=1 mkdocs build
```

The combined PDF will be available at `site/pdf/medical-appointment-system-documentation.pdf`.

### Customizing the PDF Output

You can customize the PDF output by adding CSS specifically for the PDF export:

1. Create a file called `docs/css/pdf-export.css`
2. Add your custom styles for the PDF version
3. Update the plugin configuration in `mkdocs.yml`:

```yaml
plugins:
  - pdf-export:
      combined: true
      combined_output_path: pdf/medical-appointment-system-documentation.pdf
      enabled_if_env: ENABLE_PDF_EXPORT
      custom_css_path: css/pdf-export.css
```

## Alternative PDF Generation Methods

If you prefer not to use the PDF export plugin, there are alternative methods for generating PDFs from the MkDocs site.

### Using Browser Print Function

1. Serve the documentation locally: `poetry run serve` or `mkdocs serve`
2. Open the documentation in a browser
3. Use the browser's print functionality (Ctrl+P or Cmd+P)
4. Select "Save as PDF" as the destination
5. Configure margins, headers, and footers as needed
6. Click "Save" to generate the PDF

### Using wkhtmltopdf

[wkhtmltopdf](https://wkhtmltopdf.org/) is a command-line tool that can convert HTML to PDF:

1. Install wkhtmltopdf on your system
2. Build the MkDocs site: `poetry run build` or `mkdocs build`
3. Run wkhtmltopdf on the built site:

```bash
wkhtmltopdf http://127.0.0.1:8000/ medical-appointment-system-documentation.pdf
```

Or to combine multiple pages:

```bash
wkhtmltopdf \
  http://127.0.0.1:8000/ \
  http://127.0.0.1:8000/guides/installation/ \
  http://127.0.0.1:8000/guides/user-guide/ \
  medical-appointment-system-documentation.pdf
```

## Maintaining Documentation

### Adding New Pages

1. Create a new Markdown file in the appropriate directory under `docs/`
2. Add the new page to the navigation in `mkdocs.yml`

### Documentation Best Practices

1. **Keep it updated**: Documentation should be updated whenever the system changes
2. **Use consistent formatting**: Follow the established formatting patterns
3. **Include examples**: Provide code examples and use cases
4. **Use diagrams**: Mermaid diagrams can be included using the fence syntax:

````
```mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
````

````

5. **Test links**: Ensure all internal and external links work correctly

## Versioning Documentation

If you need to maintain documentation for multiple versions of the software, you can use the `mike` plugin for MkDocs.

### With Poetry

```bash
poetry run deploy-version 1.0.0 "Initial release"
```

### Without Poetry

1. Install mike:

```bash
pip install mike
```

2. Update your `mkdocs.yml` to use mike as the version provider (already included in our configuration):

```yaml
extra:
  version:
    provider: mike
```

3. Build a version of the documentation:

```bash
mike deploy --push --update-aliases 1.0.0 latest
```

This will create documentation for version 1.0 and set it as the latest version.

## Project Structure

The documentation project is structured as follows:

```
medical-appointment-system/
├── docs/                         # Documentation source files
│   ├── api/                      # API documentation
│   ├── guides/                   # User and developer guides
│   ├── css/                      # Custom CSS
│   └── index.md                  # Home page
├── mkdocs.yml                    # MkDocs configuration
├── pyproject.toml                # Poetry configuration
├── poetry_scripts.py             # Helper scripts for Poetry commands
└── site/                         # Built documentation (generated)
```

## Troubleshooting

### Common Issues

1. **Missing dependencies**:

   - When using Poetry: run `poetry install --sync` to ensure all dependencies are installed
   - When using pip: ensure all required Python packages are installed
   - Check for system dependencies required by WeasyPrint

2. **Broken links in the PDF**:

   - The PDF export plugin may not handle some internal links correctly
   - Consider using absolute URLs for important links

3. **MkDocs serve fails to start**:

   - Check for syntax errors in the `mkdocs.yml` file
   - Verify that all referenced files exist

4. **PDF generation fails**:
   - Check WeasyPrint installation and dependencies
   - Try with a simpler subset of pages to identify problematic content

### Getting Help

If you encounter issues not covered in this guide:

1. Check the [MkDocs documentation](https://www.mkdocs.org/)
2. Check the [Material for MkDocs documentation](https://squidfunk.github.io/mkdocs-material/)
3. For PDF export issues, refer to the [mkdocs-pdf-export-plugin documentation](https://github.com/zhaoterryy/mkdocs-pdf-export-plugin)
4. For Poetry-related issues, check the [Poetry documentation](https://python-poetry.org/docs/)
````
