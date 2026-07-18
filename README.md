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
│   ├── js/
│   │   └── storybook.js    → Ortak masal motoru (sayfalar, sesler, etkileşim)
│   └── sounds/             → Gerçek hayvan sesi kayıtları (aşağıya bakın)
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

## Ses Kaynakları

Hayvan sesleri [Wikimedia Commons](https://commons.wikimedia.org/)'tan alınmıştır
(dosya yüklenemezse Web Audio ile üretilen sentez sesler yedek olarak devreye girer):

| Dosya | Kaynak | Lisans |
|-------|--------|--------|
| `kuzu.mp3` | [Sheep bleat.ogg](https://commons.wikimedia.org/wiki/File:Sheep_bleat.ogg) | CC0 |
| `miyav.mp3` | [Meow.ogg](https://commons.wikimedia.org/wiki/File:Meow.ogg) | CC BY-SA 3.0 |
| `tavuk.mp3` | [Hen announcing shes lain an egg.ogg](https://commons.wikimedia.org/wiki/File:Hen_announcing_shes_lain_an_egg.ogg) | Kamu malı |
| `civciv.mp3` | [Chicks and Cock Sound.ogg](https://commons.wikimedia.org/wiki/File:Chicks_and_Cock_Sound.ogg) | CC BY-SA 4.0 |
| `kus.mp3` | [House Sparrow (Passer domesticus) call.wav](https://commons.wikimedia.org/wiki/File:House_Sparrow_(Passer_domesticus)_call.wav) | CC BY-SA 4.0 |
| `ari.mp3` | [Bombus buzz.ogg](https://commons.wikimedia.org/wiki/File:Bombus_buzz.ogg) | Kamu malı |

Koç sesi, kuzu kaydının yavaşlatılmış (kalınlaştırılmış) halidir.

---
Duru ve Derin için, sevgiyle hazırlandı 💛
