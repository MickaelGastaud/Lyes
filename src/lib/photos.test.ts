import { describe, expect, it } from "vitest";
import { isAcceptablePhotoUrl, isBlobUrl } from "./photos";

describe("photos", () => {
  it("reconnaît les adresses du stockage Vercel Blob", () => {
    expect(isBlobUrl("https://abc123.public.blob.vercel-storage.com/vehicules/x-AbC.jpg")).toBe(true);
    expect(isBlobUrl("https://exemple.com/photo.jpg")).toBe(false);
    expect(isBlobUrl("https://blob.vercel-storage.com.pirate.com/x.jpg")).toBe(false);
    expect(isBlobUrl("/images/vehicules/x.jpg")).toBe(false);
    expect(isBlobUrl(null)).toBe(false);
  });

  it("n'accepte que les images du site ou en https", () => {
    expect(isAcceptablePhotoUrl("/images/vehicules/x.jpg")).toBe(true);
    expect(isAcceptablePhotoUrl("https://exemple.com/x.jpg")).toBe(true);
    expect(isAcceptablePhotoUrl("http://exemple.com/x.jpg")).toBe(false);
    expect(isAcceptablePhotoUrl("//exemple.com/x.jpg")).toBe(false);
    expect(isAcceptablePhotoUrl("javascript:alert(1)")).toBe(false);
  });
});
