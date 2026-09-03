from __future__ import annotations

import sys
from pathlib import Path


DOCGEN_DIR = Path(__file__).parents[1]
sys.path.insert(0, str(DOCGEN_DIR))

import api  # noqa: E402
from utils.latex_writer import _safe_signature_image_stem as safe_renderer_image  # noqa: E402


def test_public_template_fields_do_not_expose_internal_profile_tokens():
    templates = api.list_templates()

    assert templates
    assert all(
        not field.startswith("CP_")
        for template in templates
        for field in template["optional_fields"]
    )


def test_user_text_cannot_be_used_as_a_signature_image_filename():
    merged = api._merge_company_profile(
        {
            "Name": "Mourya Veer",
            "Company": "Turn2Law",
            "Date": "3 September 2026",
            "Term": "two years",
            "Jurisdiction": "Chennai",
            "CP_Signature_Image": "vjk",
        },
        None,
    )

    assert merged["CP_Signature_Image"] == ""


def test_known_signature_asset_remains_available():
    images_dir = str(DOCGEN_DIR / "images")

    assert api._safe_signature_image_stem("sample_asset_1_xref_47", images_dir) == "sample_asset_1_xref_47"
    assert safe_renderer_image("vjk", images_dir) == ""
