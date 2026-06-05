from pathlib import Path

from app.core.config import Settings


def test_settings_prefers_local_api_env_over_repo_root_env(monkeypatch) -> None:
    for key in [
        "APP_ENV",
        "DATABASE_URL",
        "REDIS_URL",
        "CORS_ORIGINS",
        "KULI_SETTINGS_ENV_FILE",
    ]:
        monkeypatch.delenv(key, raising=False)

    settings = Settings()

    assert settings.app_env == "local"
    assert settings.database_url == "postgresql+psycopg://kuli:kuli@localhost:5432/kuli_runtime"
    assert settings.redis_url == "redis://localhost:6379/0"


def test_settings_env_file_order_keeps_later_files_in_control(tmp_path: Path, monkeypatch) -> None:
    for key in [
        "APP_ENV",
        "DATABASE_URL",
        "REDIS_URL",
        "CORS_ORIGINS",
    ]:
        monkeypatch.delenv(key, raising=False)

    root_env = tmp_path / ".env"
    api_env = tmp_path / "apps" / "api" / ".env"
    api_env.parent.mkdir(parents=True)

    root_env.write_text(
        "APP_ENV=production\nDATABASE_URL=postgresql+psycopg://root:root@localhost:5432/root\n",
        encoding="utf-8",
    )
    api_env.write_text(
        "APP_ENV=local\nDATABASE_URL=sqlite:///./apps/api/data/kuli-v2.sqlite\n",
        encoding="utf-8",
    )

    settings = Settings(_env_file=(root_env, api_env))

    assert settings.app_env == "local"
    assert settings.database_url == "sqlite:///./apps/api/data/kuli-v2.sqlite"
