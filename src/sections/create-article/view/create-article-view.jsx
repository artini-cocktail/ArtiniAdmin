import { useState, useEffect } from 'react';
// import connexion with email and password
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import DeleteIcon from '@mui/icons-material/Delete';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { db, storage } from 'src/services/firebase';
// ----------------------------------------------------------------------


export const CreateArticleView = () => {
    const [pages, setPages] = useState([
        { // Première page de garde
            title: '',
            elements: [],
        }
    ]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState('');
    const [imageCover, setImageCover] = useState('');
    const [timeToRead, setTimeToRead] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetchCategories().then(setCategories);
    }, []);


    const addArticleToCategory = async (categoryName, newArticle) => {
        const docRef = doc(db, "modules", "2BYGWXW8IciaE0d0eRyB"); // chemin vers votre document contenant les catégories et articles

        try {
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();

                // Vérifie si la catégorie existe déjà
                if (data[categoryName] && data[categoryName].Articles) {
                    data[categoryName].Articles[newArticle.title] = newArticle;
                } else {
                    // Si la catégorie n'existe pas, créez-la avec le nouvel article
                    data[categoryName] = { Articles: { [newArticle.title]: newArticle } };
                }
                // Mise à jour du document avec les nouvelles données
                await setDoc(docRef, data, { merge: true });
                console.log("Article ajouté avec succès dans la catégorie:", categoryName);
            } else {
                console.log("Document n'existe pas, veuillez vérifier le chemin ou initialiser la structure de données.");
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout de l'article :", error);
        }
    };

    const fetchCategories = async () => {
        const docRef = doc(db, "modules", "2BYGWXW8IciaE0d0eRyB"); // chemin vers votre document contenant les catégories et articles
        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                const getCategories = Object.keys(data).filter(key => key !== "id"); // Exclure 'id' si présent
                console.log("Catégories récupérées:", getCategories);
                setCategory(getCategories[0]); // Sélectionnez la première catégorie par défaut
                return getCategories; // Retourne un tableau des noms des catégories
            }
            console.log("Document n'existe pas, veuillez vérifier le chemin ou initialiser la structure de données.");
            return [];
        } catch (error) {
            console.error("Erreur lors de la récupération des catégories :", error);
            return [];
        }
    };


    const handleAddPage = () => {
        const newPage = { title: '', elements: [] };
        setPages([...pages, newPage]);
        setCurrentPageIndex(pages.length);
    };

    const handleAddQuizPage = () => {
        const quizPage = {
            title: '',
            elements: [{
                type: 'quiz',
                question: '',
                answers: Array(4).fill(''),
                correctAnswer: 0,
            }],
        };
        setPages([...pages, quizPage]);
        setCurrentPageIndex(pages.length); // Se déplacer vers la nouvelle page de quiz
    };

    const handleDeletePage = (pageIndex) => {
        if (pages.length > 1) {
            const updatedPages = pages.filter((_, index) => index !== pageIndex);
            setPages(updatedPages);
            setCurrentPageIndex(prevIndex => prevIndex > 0 ? prevIndex - 1 : 0);
        } else {
            alert("Vous ne pouvez pas supprimer la dernière page.");
        }
    };

    const handleAddElement = (type) => {
        const newElement = type === 'text' ? { type: 'text', content: '' } : { type: 'image', content: '' };
        const updatedPages = [...pages];
        updatedPages[currentPageIndex].elements.push(newElement);
        setPages(updatedPages);
    };

    const handleDeleteElement = (elementIndex) => {
        const updatedPages = [...pages];
        updatedPages[currentPageIndex].elements.splice(elementIndex, 1);
        setPages(updatedPages);
    };

    const updateQuizContent = (elementIndex, value, key) => {
        const updatedPages = [...pages];
        const quiz = updatedPages[currentPageIndex].elements[elementIndex];
        if (key === 'question') {
            quiz.question = value;
        } else if (key === 'correctAnswer') {
            quiz.correctAnswer = parseInt(value, 10);
        } else if (key.includes('answer')) {
            const answerIndex = parseInt(key.split('_')[1], 10);
            quiz.answers[answerIndex] = value;
        }
        setPages(updatedPages);
    };

    const uploadImageAndReplaceUrl = async (element) => {
        if (element.type === 'image') {
            console.log("Téléchargement de l'image et remplacement de l'URL:", element.content);
            const url = await uploadImageToStorage(element.content); // Assurez-vous que element.content est un File
            return { ...element, content: url };
        }
        return element;
    };

    const preparePageContent = async (page) => {
        console.log("Préparation de la page pour la soumission:", page);
        const elements = await Promise.all(page.elements.map(uploadImageAndReplaceUrl));
        return { ...page, elements };
    };


    const handleSubmit = async () => {
        const convertedImageCover = await uploadImageToStorage(imageCover);
        await addArticleToCategory(category, { title: pages[0].title, nbPages: pages.length - 1, image: convertedImageCover, likes: 0, timeToRead, description });


        // submit toutes les images et met à jour les URL dans les pages
        const updatedPages = await Promise.all(pages.map(preparePageContent));
        console.log("Pages préparées pour la soumission:", updatedPages);
        // Structurez les données des pages comme requis
        const pagesObject = updatedPages.reduce((acc, page, index) => {
            // Détermine si la page actuelle est un quiz
            const isQuizPage = page.elements.some(element => element.type === 'quiz');

            const pageIndex = isQuizPage ? `Quizz_${index + 1}` : `Page_${index + 1}`;
            acc[pageIndex] = {
                Title: page.title,
                content: isQuizPage
                    ? { ...page.elements[0] } // Si c'est une page de quiz, utilisez directement le premier élément (le quiz)
                    : page.elements.reduce((contentAcc, element, elementIndex) => {
                        const key = `${element.type}_${elementIndex + 1}`;
                        contentAcc[key] = element.content; // Pour les images, l'URL de Firebase Storage sera utilisée
                        return contentAcc;
                    }, {})
            };
            return acc;
        }, {});

        console.log("Pages préparées pour la soumission:", pagesObject);
        await setDoc(doc(db, "modules", "2BYGWXW8IciaE0d0eRyB", "Articles", pages[0].title), pagesObject);
    };


    const renderPageElements = (elements) => elements.map((element, index) => {
        let renderedElement = null;

        if (element.type === 'text') {
            renderedElement = (
                <TextField
                    fullWidth
                    multiline
                    variant="outlined"
                    value={element.content}
                    onChange={(e) => {
                        const updatedPages = [...pages];
                        updatedPages[currentPageIndex].elements[index].content = e.target.value;
                        setPages(updatedPages);
                    }}
                />
            );
        } else if (element.type === 'image') {
            renderedElement = (
                <input
                    type="file"
                    onChange={(e) => {
                        const updatedPages = [...pages];
                        updatedPages[currentPageIndex].elements[index].content = e.target.files[0];
                        setPages(updatedPages);
                    }}
                />
            );
        } else if (element.type === 'quiz') {
            renderedElement = (
                <Card style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <TextField
                        fullWidth
                        label="Question du Quiz"
                        variant="outlined"
                        value={element.question}
                        onChange={(e) => updateQuizContent(index, e.target.value, 'question')}
                    />
                    <>
                        {element.answers.map((answer, ansIndex) => (
                            <TextField
                                key={`answer_${ansIndex}`}
                                fullWidth
                                label={`Réponse ${ansIndex + 1}`}
                                variant="outlined"
                                value={answer}
                                onChange={(e) => updateQuizContent(index, e.target.value, `answer_${ansIndex}`)}
                            />
                        ))}
                    </>
                    <RadioGroup
                        row
                        value={element.correctAnswer.toString()}
                        onChange={(e) => updateQuizContent(index, e.target.value, 'correctAnswer')}
                    >
                        {element.answers.map((_, ansIndex) => (
                            <FormControlLabel key={ansIndex} value={ansIndex.toString()} control={<Radio />} label={`Réponse ${ansIndex + 1}`} />
                        ))}
                    </RadioGroup>
                </Card>
            );
        }

        return (
            <Stack key={index} direction="row" alignItems="center" spacing={1}>
                {renderedElement}
                <IconButton aria-label="delete" onClick={() => handleDeleteElement(index)}>
                    <DeleteIcon />
                </IconButton>
            </Stack>
        );
    });

    return (
        <Box sx={{ p: 4 }}>
            <Stack spacing={2}>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Catégorie</InputLabel>
                    {categories.includes(category) ? (
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={category}
                            label="Catégorie"
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            {categories.map((cat) => (
                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                            ))}
                            <MenuItem value="new">Nouvelle Catégorie</MenuItem>
                        </Select>
                    )
                        : (
                            <TextField
                                fullWidth
                                label="Nom de la catégorie"
                                variant="outlined"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        )}

                    <TextField
                        fullWidth
                        label="Description"
                        variant="outlined"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Temps de lecture"
                        variant="outlined"
                        value={timeToRead}
                        onChange={(e) => setTimeToRead(e.target.value)}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                        }}
                    />
                    {/* button to chose the cover picture */}
                    <Button variant="contained" component="label" sx={{ mt: 2 }}>
                        Choisir une image de couverture
                        <input
                            type="file"
                            hidden
                            onChange={(e) => {
                                setImageCover(e.target.files[0]);
                            }}
                        />
                    </Button>
                    {
                        imageCover && (
                            <img src={URL.createObjectURL(imageCover)} alt="cover" style={{ width: 200, height: 'auto', objectFit: 'cover', marginTop: 16 }} />
                        )
                    }
                </FormControl>
                {pages.map((page, index) => (
                    <Card key={index} variant="outlined" sx={{ p: 2 }}>
                        <TextField
                            fullWidth
                            label="Titre de la page"
                            variant="outlined"
                            value={page.title}
                            onChange={(e) => {
                                const updatedPages = [...pages];
                                updatedPages[index].title = e.target.value;
                                setPages(updatedPages);
                            }}
                        />
                        {renderPageElements(page.elements)}
                        {index === currentPageIndex && (
                            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                <Button variant="contained" onClick={() => handleAddElement('text')}>Ajouter Texte</Button>
                                <Button variant="contained" onClick={() => handleAddElement('image')}>Ajouter Image</Button>
                                {pages.length > 1 && (
                                    <IconButton aria-label="delete page" onClick={() => handleDeletePage(index)}>
                                        <DeleteIcon />
                                    </IconButton>
                                )}
                            </Stack>
                        )}
                    </Card>
                ))}
                <Button variant="outlined" onClick={handleAddPage}>Ajouter une Page</Button>
                <Button variant="outlined" onClick={handleAddQuizPage}>Ajouter une Page de Quiz</Button>
                {/* Submit Button here */}
                <Button variant="contained" onClick={handleSubmit}>Créer l`&apos;`article</Button>
            </Stack>
        </Box>
    );
};

const uploadImageToStorage = async (file) => {
    if (!file) return null;
    console.log("Uploading image to storage...");
    const storageRef = ref(storage, `articles/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    console.log("Image uploaded to storage:", downloadURL);
    return downloadURL;
};

export default CreateArticleView