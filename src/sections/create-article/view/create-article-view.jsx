import { useState, useRef, useEffect } from 'react';
// import connexion with email and password
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, getDoc, doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

import { db, storage } from 'src/services/firebase';

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';


import DeleteIcon from '@mui/icons-material/Delete';
// ----------------------------------------------------------------------


const createArticleView = () => {
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
                let data = docSnap.data();

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
                const categories = Object.keys(data).filter(key => key !== "id"); // Exclure 'id' si présent
                console.log("Catégories récupérées:", categories);
                setCategory(categories[0]); // Sélectionnez la première catégorie par défaut
                return categories; // Retourne un tableau des noms des catégories
            } else {
                console.log("Document n'existe pas, veuillez vérifier le chemin ou initialiser la structure de données.");
                return [];
            }
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
            const url = await uploadImageToStorage(element.content); // Assurez-vous que element.content est un File
            return { ...element, content: url };
        }
        return element;
    };

    const preparePageContent = async (page) => {
        const elements = await Promise.all(page.elements.map(uploadImageAndReplaceUrl));
        return { ...page, elements };
    };


    const handleSubmit = async () => {
        addArticleToCategory(category, { title: pages[0].title, nbPages: pages.length - 1, pages, image: imageCover, likes: 0, timeToRead, description });
        const updatedPages = await Promise.all(pages.map(preparePageContent));

        // Structurez les données des pages comme requis
        const pagesObject = updatedPages.reduce((acc, page, index) => {
            acc[`Page_${index + 1}`] = {
                Title: page.title,
                content: page.elements.reduce((contentAcc, element, elementIndex) => {
                    const key = element.type + '_' + (elementIndex + 1);
                    contentAcc[key] = element.content; // Pour les images, l'URL de Firebase Storage sera utilisée
                    return contentAcc;
                }, {})
            };
            return acc;
        }, {});
        await setDoc(doc(db, "modules", "2BYGWXW8IciaE0d0eRyB", "Articles", pages[0].title), pagesObject);
    };

    const renderPageElements = (elements) => elements.map((element, index) => (
        <Stack key={index} direction="row" alignItems="center" spacing={1}>
            {element.type === 'text' ? (
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
            ) : element.type === 'image' ? (
                <input
                    type="file"
                    onChange={(e) => {
                        // Handle image change...
                    }}
                />
            ) : element.type === 'quiz' ? (
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
            ) : null}
            <IconButton aria-label="delete" onClick={() => handleDeleteElement(index)}>
                <DeleteIcon />
            </IconButton>
        </Stack>
    ));

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
                <Button variant="contained" onClick={handleSubmit}>Créer l'article</Button>
            </Stack>
        </Box>
    );
};

const uploadImageToStorage = async (file) => {
    if (!file) return null;

    const storageRef = ref(storage, `articles/${file.name}_${Date.now()}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
};

export default createArticleView