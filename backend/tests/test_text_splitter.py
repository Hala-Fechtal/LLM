from rag.text_splitter import split_text_simple, split_documents


def test_empty_text_returns_empty_list():
    # Cas limite : pas de texte, pas de chunks.
    assert split_text_simple("") == []


def test_short_text_returns_a_single_chunk():
    # Un texte plus court que chunk_size ne doit pas être découpé.
    text = "Bonjour"
    result = split_text_simple(text, chunk_size=1000, chunk_overlap=200)
    assert result == ["Bonjour"]


def test_long_text_splits_with_overlap():
    # Texte de 15 caractères, calculé à la main dans l'explication ci-dessus.
    text = "abcdefghijklmno"

    result = split_text_simple(text, chunk_size=10, chunk_overlap=3)

    assert result == ["abcdefghij", "hijklmno", "o"]

    # Preuve concrète du chevauchement : les 3 derniers caractères du 1er
    # chunk sont les 3 premiers du 2e.
    assert result[0][-3:] == result[1][:3] == "hij"


def test_split_documents_preserves_metadata_and_numbers_paragraphs():
    # split_documents() doit garder les métadonnées d'origine (page, source...)
    # et ajouter un numéro de paragraphe séquentiel par page.
    pages = [
        {
            "text": "abcdefghijklmno",
            "metadata": {"page": 1, "source": "test.pdf", "document_id": "doc-1"},
        }
    ]

    chunks = split_documents(pages, chunk_size=10, chunk_overlap=3)

    assert len(chunks) == 3
    assert chunks[0]["metadata"]["paragraph"] == 1
    assert chunks[1]["metadata"]["paragraph"] == 2
    assert chunks[0]["metadata"]["page"] == 1
    assert chunks[0]["metadata"]["source"] == "test.pdf"
