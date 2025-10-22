import * as Yup from 'yup';

// Validation schema for cocktail forms
export const cocktailValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Le nom du cocktail est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  
  type: Yup.string()
    .oneOf(['Classic', 'Original'], 'Type invalide')
    .required('Le type est requis'),
  
  creator: Yup.string()
    .when('type', {
      is: 'Original',
      then: (schema) => schema.required('Le créateur est requis pour un cocktail original'),
      otherwise: (schema) => schema.notRequired(),
    }),
  
  glass: Yup.string()
    .required('Le type de verre est requis'),
  
  degree: Yup.string()
    .oneOf(['Mocktail', 'Weak', 'Medium', 'Strong'], 'Degré invalide')
    .required('Le degré est requis'),
  
  ice: Yup.string()
    .oneOf(['Without', 'Crushed', 'Cube'], 'Type de glaçon invalide')
    .required('Le type de glaçon est requis'),
  
  ingredients: Yup.array()
    .of(
      Yup.object().shape({
        value: Yup.number()
          .min(0, 'La quantité doit être positive')
          .required('La quantité est requise'),
        unit: Yup.string()
          .required('L\'unité est requise'),
        text: Yup.string()
          .required('L\'ingrédient est requis')
          .min(1, 'L\'ingrédient ne peut pas être vide'),
      })
    )
    .min(1, 'Au moins un ingrédient est requis')
    .required('Les ingrédients sont requis'),
  
  steps: Yup.array()
    .of(
      Yup.object().shape({
        text: Yup.string()
          .required('La description de l\'étape est requise')
          .min(10, 'L\'étape doit contenir au moins 10 caractères'),
      })
    )
    .min(1, 'Au moins une étape est requise')
    .required('Les étapes sont requises'),
  
  description: Yup.string()
    .required('La description est requise')
    .min(20, 'La description doit contenir au moins 20 caractères'),
  
  photo: Yup.string()
    .required('Une photo est requise'),
});

export default cocktailValidationSchema;