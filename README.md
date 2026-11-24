# claude-context-gauge (baglam-gostergesi)

A Claude Code mod that shows how full the context window is, in a one-line bar
above the prompt, refreshed after every request. The mod's on-screen text is in
Turkish.

Claude Code için bir mod: bağlam penceresinin ne kadar dolduğunu, istem
kutusunun üstündeki tek satırlık bir çubukta gösterir ve her istekten sonra
günceller.

```
Bağlam ████████░░░░░░░░░░░░ %42 · 84,3 bin / 200 bin token
```

## What it does / Ne yapar

- Updates after every main-thread turn. / Her isteğin sonunda yenilenir.
- Green below 60%, yellow from 60% to 85%, red from 85%. / %60'a kadar yeşil,
  %60–85 arası sarı, %85'ten sonra kırmızı.
- One toast when the fill first crosses 85%, suggesting `/compact`. / Doluluk
  %85'i ilk kez aştığında, `/compact` öneren tek bir bildirim gösterir.
- Before the first reading of a new or just-compacted session it says so
  instead of drawing a bar. / Yeni ya da yeni sıkıştırılmış oturumda ilk
  ölçüme kadar "henüz ölçüm yok" yazar.

## Install / Kurulum

At the prompt of a terminal session / Bir terminal oturumunun isteminde:

```
/plugin install baglam-gostergesi --marketplace seyfettin-code/claude-context-gauge
```

From a shell / Kabuktan:

```
claude plugin install baglam-gostergesi --marketplace seyfettin-code/claude-context-gauge
```

In the desktop app, where `/plugin` does not run: click + next to the prompt
box, then Plugins, Add marketplace with `seyfettin-code/claude-context-gauge`,
then Add plugin.

Masaüstü uygulamasında `/plugin` çalışmaz: istem kutusunun yanındaki + düğmesine,
sonra Plugins'e tıklayın; Add marketplace ile
`seyfettin-code/claude-context-gauge` ekleyin, ardından Add plugin'i seçin.

The mod uses Claude Code's function hooks, an early-access API: it needs a
recent Claude Code (written and tested on 2.1.330) and may need changes as that
API moves.

Mod, Claude Code'un erken erişimdeki işlev kancalarını kullanır: güncel bir
Claude Code gerektirir (2.1.330 üzerinde yazıldı ve denendi).

## Develop / Geliştirme

```
claude plugin validate .
claude plugin test .
```
