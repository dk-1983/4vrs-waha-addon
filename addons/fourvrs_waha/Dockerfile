# Unmodified upstream WAHA Core runtime. See licenses/NOTICE.md.
FROM devlikeapro/waha@sha256:a033abb9381a80246b9b3ec52141bfd7259e48bcea52286f53db25a013e526e0
ARG BUILD_ARCH=amd64
ARG BUILD_VERSION=0.1.0
LABEL io.hass.name="4VRS WhatsApp (WAHA)" \
      io.hass.description="Unofficial Home Assistant wrapper for WAHA Core" \
      io.hass.type="addon" \
      io.hass.version="${BUILD_VERSION}" \
      io.hass.arch="${BUILD_ARCH}" \
      org.opencontainers.image.source="https://github.com/dk-1983/4vrs-waha-addon"
COPY app/ /opt/fourvrs/
COPY licenses/ /opt/fourvrs/licenses/
HEALTHCHECK --interval=30s --timeout=7s --start-period=120s --retries=3 CMD ["node", "/opt/fourvrs/healthcheck.cjs"]
ENTRYPOINT ["/usr/bin/tini", "--", "node", "--disable-warning=ExperimentalWarning", "/opt/fourvrs/main.cjs"]
CMD []
