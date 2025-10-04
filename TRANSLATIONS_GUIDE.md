# Guide de Gestion des Traductions

## 📋 Vue d'ensemble

Ce module permet de gérer facilement les traductions de l'application Artini avec :
- ✅ Création de nouveaux fichiers de traduction
- ✅ Import/Export de fichiers JSON
- ✅ Auto-traduction via DeepL API
- ✅ Éditeur interactif avec navigation
- ✅ Structure hiérarchique préservée

## 🚀 Accès

1. Connectez-vous à l'admin dashboard
2. Naviguez vers `/translations` ou cliquez sur "Traductions" dans le menu

## 📝 Comment utiliser

### 1. Créer une nouvelle traduction

1. **Entrez les informations de langue**
   - Code de langue (ex: `es`, `de`, `it`, `pt`)
   - Nom de la langue (ex: `Español`, `Deutsch`)

2. **Cliquez sur "Nouvelle traduction"**
   - Une structure de base sera créée avec toutes les sections nécessaires

3. **Modifiez les traductions**
   - Naviguez dans les sections en cliquant sur les dossiers
   - Éditez directement les valeurs dans les champs de texte
   - Ajoutez de nouvelles clés avec "Ajouter clé"
   - Ajoutez de nouvelles sections avec "Ajouter section"

4. **Exportez le fichier**
   - Cliquez sur "Exporter JSON"
   - Le fichier sera téléchargé avec le nom `{code_langue}.json`

### 2. Modifier une traduction existante

1. **Importez le fichier JSON**
   - Cliquez sur "Importer JSON"
   - Sélectionnez votre fichier de traduction (ex: `en.json`)

2. **Modifiez les traductions**
   - Utilisez la barre de recherche pour trouver des clés spécifiques
   - Naviguez dans la structure hiérarchique
   - Supprimez des clés avec le bouton "Supprimer"

3. **Exportez les modifications**
   - Cliquez sur "Exporter JSON"

### 3. Auto-traduction avec DeepL

#### Configuration initiale

1. **Obtenez une clé API DeepL**
   - Gratuit: https://www.deepl.com/pro-api (500,000 caractères/mois)
   - Créez un compte DeepL
   - Copiez votre clé API

2. **Configurez la clé dans .env**
   ```bash
   # Copiez .env.example vers .env
   cp .env.example .env

   # Ajoutez votre clé DeepL
   VITE_DEEPL_API_KEY=votre_clé_deepl_ici
   ```

3. **Redémarrez le serveur de développement**
   ```bash
   npm run dev
   ```

#### Utilisation

1. **Importez le fichier source** (ex: `fr.json`)
   - Cliquez sur "Import source (FR)"
   - Sélectionnez votre fichier de référence en français

2. **Sélectionnez la langue cible**
   - Choisissez parmi les 30+ langues supportées

3. **Lancez la traduction**
   - Cliquez sur "Traduire tout"
   - Une barre de progression s'affichera
   - La traduction se fait automatiquement

4. **Vérifiez et ajustez**
   - Passez en revue les traductions générées
   - Faites les ajustements nécessaires

5. **Exportez le fichier traduit**
   - Cliquez sur "Exporter JSON"

## 🌍 Langues supportées par DeepL

- 🇪🇸 Espagnol (ES)
- 🇩🇪 Allemand (DE)
- 🇮🇹 Italien (IT)
- 🇵🇹 Portugais (PT)
- 🇳🇱 Néerlandais (NL)
- 🇵🇱 Polonais (PL)
- 🇷🇺 Russe (RU)
- 🇯🇵 Japonais (JA)
- 🇰🇷 Coréen (KO)
- 🇨🇳 Chinois (ZH)
- Et 20+ autres langues...

## 📊 Structure des fichiers de traduction

```json
{
  "common": {
    "actions": {},
    "labels": {},
    "messages": {},
    "navigation": {}
  },
  "business": {
    "cocktail": {},
    "user": {},
    "collection": {},
    "categories": {},
    "badges": {}
  },
  "pages": {},
  "offline": {},
  "errors": {},
  "success": {},
  "filters": {},
  "contextMenu": {},
  "input": {},
  "lists": {},
  "header": {},
  "option": {}
}
```

## 🔧 Fonctionnalités de l'éditeur

### Navigation
- 📁 Cliquez sur une section pour naviguer dedans
- 🏠 Utilisez les breadcrumbs pour revenir en arrière
- 🔍 Recherchez des clés ou valeurs avec la barre de recherche

### Édition
- ✏️ Modifiez directement les valeurs dans les champs de texte
- ➕ Ajoutez de nouvelles clés avec "Ajouter clé"
- 📂 Ajoutez de nouvelles sections avec "Ajouter section"
- 🗑️ Supprimez des clés avec le bouton "Supprimer"
- 👁️ Prévisualisez les sections avec "Aperçu"

### Statistiques
- 📊 Nombre total de clés affiché en haut
- 🏷️ Code de langue affiché
- 🔢 Nombre d'items par section

## ⚠️ Bonnes pratiques

1. **Sauvegardez toujours**
   - Gardez une copie de sauvegarde avant modifications
   - Exportez régulièrement vos traductions

2. **Vérifiez les traductions automatiques**
   - DeepL est excellent mais pas parfait
   - Relisez toujours les traductions générées
   - Ajustez selon le contexte de l'application

3. **Cohérence**
   - Gardez le même format que le fichier source
   - Ne supprimez pas de clés existantes
   - Ajoutez de nouvelles clés si nécessaire

4. **Structure**
   - Respectez la hiérarchie des sections
   - Utilisez des noms de clés descriptifs
   - Groupez les traductions liées

## 🐛 Dépannage

### La traduction DeepL ne fonctionne pas
- ✅ Vérifiez que `VITE_DEEPL_API_KEY` est défini dans `.env`
- ✅ Vérifiez que vous avez redémarré le serveur après modification
- ✅ Vérifiez votre quota DeepL (500k caractères/mois en gratuit)
- ✅ Vérifiez la console du navigateur pour les erreurs

### Le fichier exporté est vide
- ✅ Vérifiez que vous avez bien importé ou créé des traductions
- ✅ Essayez de rafraîchir la page

### Certaines clés ne se traduisent pas
- ✅ Vérifiez votre connexion internet
- ✅ DeepL peut échouer sur certains caractères spéciaux
- ✅ Traduisez ces clés manuellement

## 📦 Déploiement

Pour utiliser les traductions dans l'application Artini :

1. Exportez le fichier de traduction (ex: `es.json`)
2. Copiez-le dans `/Users/julien/Desktop/Artini-new/locales/translations/`
3. L'application détectera automatiquement la nouvelle langue

## 🔐 Sécurité

- ⚠️ Ne commitez JAMAIS le fichier `.env` avec votre clé API
- ✅ Utilisez `.env.example` comme référence
- ✅ Ajoutez `.env` dans `.gitignore`

## 📞 Support

Pour toute question ou problème :
- Consultez la documentation DeepL : https://www.deepl.com/docs-api
- Vérifiez les logs de la console
- Contactez l'équipe de développement
