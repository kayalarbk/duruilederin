# 📚 Duru ile Derin'in Masal Kitaplığı

Berrak ile Dada'nın maceralarını anlatan, çocuklar için hazırlanmış **animasyonlu ve interaktif** masal kitapları.

🌐 **Canlı adres:** https://kayalarbk.github.io/duruilederin/

## Bölümler

| Bölüm | Hikaye | Karakterler |
|-------|--------|-------------|
| 1. Bölüm | [Çiftlikte Bir Ders](bolum1/index.html) 🐱 | Yavru kediler — kümes kurtarma oyunu içerir! |
| 2. Bölüm | [Kuzucuklar](bolum2/index.html) 🐑 | Kuzular — saklı göl ve bulut oyunu içerir! |

## Klasör Yapısı

```
├── index.html              → Masal kitaplığı (bölüm seçme ekranı)
├── assets/
│   ├── css/
│   │   ├── storybook.css   → Ortak masal motoru stilleri
│   │   └── bolum1.css      → Bölüm 1'e özel stiller (kümes, kovalamaca)
│   └── js/
│       └── storybook.js    → Ortak masal motoru (sayfalar, sesler, etkileşim)
├── bolum1/index.html       → 1. Bölüm: Çiftlikte Bir Ders
├── bolum2/index.html       → 2. Bölüm: Kuzucuklar
└── hikayeler/              → Orijinal hikaye metinleri (Markdown)
```

## Yeni Bölüm Ekleme

1. Hikaye metnini `hikayeler/` klasörüne `.md` olarak ekleyin.
2. `bolum2/index.html` dosyasını kopyalayıp yeni bölüm klasörü oluşturun (`bolum3/`).
3. Karakterleri `Storybook.chars({...})` ile, sayfaları `pages` dizisiyle tanımlayın.
4. Bölüme özel animasyon gerekiyorsa `assets/css/bolumX.css` ekleyin.
5. Ana sayfadaki (`index.html`) rafa yeni bölüm kartı ekleyin.

---
Duru ve Derin için, sevgiyle hazırlandı 💛
