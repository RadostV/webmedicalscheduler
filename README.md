# Medical Appointment System Documentation

This repository contains the documentation for the Medical Appointment System, a full-stack application for managing doctor appointments, schedule tracking, and patient bookings.

## Documentation Overview

The documentation is built using [MkDocs](https://www.mkdocs.org/) with the [Material theme](https://squidfunk.github.io/mkdocs-material/) and includes:

- User guides for patients and doctors
- Developer guides for extending and maintaining the system
- API documentation for both backend and frontend
- Database schema documentation
- Deployment guides
- Testing guides

## Quick Start

### Using Poetry (Recommended)

1. Ensure you have [Poetry](https://python-poetry.org/docs/#installation) installed
2. Clone this repository
3. Install dependencies:

```bash
poetry install
```

4. Serve the documentation locally:

```bash
./docs.sh serve
```

5. Open your browser and navigate to http://127.0.0.1:8000/

### Using pip

1. Ensure you have Python 3.6+ installed
2. Clone this repository
3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Serve the documentation locally:

```bash
mkdocs serve
```

5. Open your browser and navigate to http://127.0.0.1:8000/

## Documentation Commands

### With Poetry

- Serve documentation: `./docs.sh serve`
- Build documentation: `./docs.sh build`
- Build with PDF export: `./docs.sh build-pdf`
- Deploy a new version: `./docs.sh deploy-version 1.0.0 "Release message"`

### Without Poetry

- Serve documentation: `mkdocs serve`
- Build documentation: `mkdocs build`
- Build with PDF export: `ENABLE_PDF_EXPORT=1 mkdocs build`
- Deploy a new version: `mike deploy --push --update-aliases 1.0.0 latest`

## Contributing to Documentation

Please see [Documentation Guide](docs/guides/documentation-guide.md) for detailed information on how to contribute to the documentation, including:

- Setting up the documentation environment
- Writing and formatting guidelines
- Adding new pages
- Generating PDFs
- Versioning documentation

## System Requirements

- Python 3.8+ (for Poetry)
- Python 3.6+ (for direct pip install)
- Additional system dependencies for WeasyPrint (for PDF generation)

## License

This documentation is licensed under [MIT License](LICENSE).

## Contact

For questions or issues regarding the documentation, please contact the Medical Appointment Team at team@example.com.
