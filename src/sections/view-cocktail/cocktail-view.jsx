import {
  useRef, useState, useEffect
} from 'react';// import connexion with email and password
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import ButtonGroup from '@mui/material/ButtonGroup';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import { bgGradient } from 'src/theme/css';
import { db, storage } from 'src/services/firebase';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function CocktailView() {
  const theme = useTheme();

  const fileInputRef = useRef(null);

  // get the parameter from the url
  const queryParameters = new URLSearchParams(window.location.search)
  const id = queryParameters.get('id');
  useEffect(() => {
    if (id) {
      fetchCocktail(id);
    }
  }, [id]);


  const fetchCocktail = async (idCocktail) => {
    const docSnap = await getDoc(doc(db, "cocktails", idCocktail));
    if (docSnap.exists()) {
      setCocktail(docSnap.data());
    }
  };


  const [downloadURL, setDownloadURL] = useState("");

  const [percent, setPercent] = useState(0);
  const glassList = ["Martini", "Rock", "Flute", "Tiki", "Beer", "Champagne", "Old fashioned", "Highball", "Hurricane", "Shooter", "Margarita", "Pilsner", "Balloon"];

  const [cocktail, setCocktail] = useState(
    {
      name: "",
      creator: "",
      type: "Classic",
      glass: "Martini",
      degree: "Mocktail",
      ice: "Without",
      ingredients: [
        {
          value: 0,
          unit: "ml",
          text: "",
        },
      ],
      steps: [
        {
          text: "",
        },
      ],
      description: "",
      photo: "",
      Validated: false,
      publisher: "r119v4QX3eMfWIhHRsesPp53t7X2"

    }
  );

  useEffect(() => {
    if (downloadURL !== "") {
      setCocktail((prevCocktail) => ({ ...prevCocktail, photo: downloadURL }));
    }
  }, [downloadURL, cocktail]);


  const handleFileUpload = (event) => {
    event.preventDefault(); // Empêcher le comportement par défaut du navigateur
    const file = event.target.files[0];
    const fileExtension = file.name.split(".")[1];
    const { name } = cocktail;
    const storageRef = ref(storage, `images/${name}.${fileExtension}`)
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percentValue = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );

        // update progress
        setPercent(percentValue);
      },
      (err) => console.log(err),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setDownloadURL(url);
          setPercent(100);
          setCocktail((prevCocktail) => ({ ...prevCocktail, photo: url }));
        });
      }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // mofify the cocktail in the database with the new value
    const docRef = doc(db, "cocktails", id);
    await updateDoc(docRef, cocktail);
    // if success we display a message
    toast.success('🍸 Le cocktail à bien été modifié!', {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };



  const renderForm = (
    <>
      <Stack spacing={3} sx={{ my: 3 }} alignItems="center">
        {/* invisible hover for button */}
        <button type="button" onClick={() => fileInputRef.current.click()} tabIndex={0} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <img
            src={cocktail?.photo || '/assets/background/overlay_create_cocktail.png'}
            alt={cocktail?.name}
            className="cardPhotoDetails"
            width={300}
            height={300}
          />
        </button>
        <Button variant="contained" onClick={() => fileInputRef.current.click()}>
          Upload photo
        </Button>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
        {percent > 0 && percent < 100 &&
          <Typography variant="h6">{percent}% done</Typography>
        }
        <TextField
          value={cocktail?.name}
          onChange={(e) => setCocktail({ ...cocktail, name: e.target.value })}
          name="Nom du cocktail"
          label="Nom du cocktail"
        />
        {/* separate both buttons */}
        <ButtonGroup variant="contained" aria-label="Basic button group" style={{ width: '50%' }}>
          {/* if classic is selected the color of the button is orange else is white and text change in  black */}
          <Button onClick={() => setCocktail({ ...cocktail, type: "Classic" })} style={{ backgroundColor: cocktail.type === "Classic" ? "orange" : "white", color: "black" }} fullWidth>Classic</Button>
          <Button onClick={() => setCocktail({ ...cocktail, type: "Original" })} style={{ backgroundColor: cocktail.type === "Original" ? "orange" : "white", color: "black" }} fullWidth>Original</Button>
        </ButtonGroup>
        {
          cocktail.type === "Original" &&
          <TextField
            value={cocktail?.creator}
            onChange={(e) => setCocktail({ ...cocktail, creator: e.target.value })}
            name="creator"
            label="Créateur"

            // at the end of the input we add a button to add user from the database
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setCocktail({ ...cocktail, creator: "" })}>
                    <Iconify icon="bi:person-plus" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        }
      </Stack>
      <Typography variant="h6">Ingrédients</Typography>
      <Stack spacing={3} sx={{ my: 3 }} alignItems="center">
        {/* champ text avec des suggestion, si on clique sur une suggestion elle deviens la valeur et disparait */}
        <TextField
          value={cocktail?.glass}
          onChange={(e) => setCocktail({ ...cocktail, glass: e.target.value })}
          name="glass"
          style={{ width: '50%' }}
          label="Verre"
          select
          SelectProps={{
            native: true,
          }}
        >
          {glassList.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
          <option value="Autre">Autre</option>
        </TextField>
        {
          glassList.includes(cocktail.glass) === false &&
          <TextField
            value={cocktail?.glass}
            onChange={(e) => setCocktail({ ...cocktail, glass: e.target.value })}
            name="glass"
            label="Verre"
            style={{ width: '50%' }}
          />
        }
        <TextField
          value={cocktail?.degree}
          onChange={(e) => setCocktail({ ...cocktail, degree: e.target.value })}
          name="degree"
          label="Degré"
          select
          SelectProps={{
            native: true,
          }}
          style={{ width: '50%' }}
        >
          <option value="Mocktail">Mocktail</option>
          <option value="Weak">Weak</option>
          <option value="Medium">Medium</option>
          <option value="Strong">Strong</option>
        </TextField>

        <TextField
          value={cocktail?.ice}
          onChange={(e) => setCocktail({ ...cocktail, ice: e.target.value })}
          name="ice"
          label="Glaçons"
          style={{ width: '50%' }}
          select
          SelectProps={{
            native: true,
          }}
        >
          <option value="Without">Without</option>
          <option value="Crushed">Crushed</option>
          <option value="Cube">Cube</option>
        </TextField>
      </Stack>

      <Typography variant="h6">Recette</Typography>
      <Stack spacing={3} sx={{ my: 3 }} alignItems='center'>
        {
          cocktail?.ingredients.map((ingredient, index) => (
            <Stack key={index} direction="row" spacing={2} alignItems="center">
              <TextField
                value={ingredient.value}
                onChange={(e) =>
                  setCocktail({
                    ...cocktail,
                    ingredients: cocktail.ingredients.map((ingredientValue, i) =>
                      i === index ? { ...ingredientValue, value: parseInt(e.target.value, 10) } : ingredientValue
                    ),
                  })
                }
                name="value"
                label="Quantité"
                type="number"
              />
              <TextField
                value={ingredient.unit}
                onChange={(e) =>
                  setCocktail({
                    ...cocktail,
                    ingredients: cocktail.ingredients.map((ingredientValue, i) =>
                      i === index ? { ...ingredientValue, unit: e.target.value } : ingredientValue
                    ),
                  })
                }
                name="unit"
                label="Unité"
                select
                SelectProps={{
                  native: true,
                }}
              >
                <option value="ml">ml</option>
                <option value="cl">cl</option>
                <option value="Oz">Oz</option>
                <option value="Part">Part</option>
                {
                  cocktail?.ingredients[index].value <= "1" ? (
                    <>
                      <option value="Drop">drop</option>
                      <option value="Leaf">leaf</option>
                      <option value="Wedge">wedge</option>
                      <option value="Piece">piece</option>
                      <option value="Spoon">spoon</option>
                      <option value="Cube">cube</option>
                      <option value="Slice">slice</option>
                      <option value="Half">half</option>
                    </>
                  ) : (
                    <>
                      <option value="Drops">drops</option>
                      <option value="Leaves">leaves</option>
                      <option value="Wedges">wedges</option>
                      <option value="Pieces">pieces</option>
                      <option value="Spoons">spoons</option>
                      <option value="Cubes">cubes</option>
                      <option value="Slices">slices</option>
                      <option value="Halves">halves</option>
                    </>
                  )
                }
                <option value="" />
              </TextField>
              <TextField
                value={ingredient.text}
                onChange={(e) =>
                  setCocktail({
                    ...cocktail,
                    ingredients: cocktail.ingredients.map((ingredientValue, i) =>
                      i === index ? { ...ingredientValue, text: e.target.value } : ingredientValue
                    ),
                  })
                }
                name="text"
                label="Ingrédient"
              />

              <IconButton onClick={() =>
                setCocktail({
                  ...cocktail,
                  ingredients: cocktail.ingredients.filter((ingredientValue, i) => i !== index),
                })
              }>
                <Iconify icon="bi:trash" />
              </IconButton>
            </Stack>
          ))
        }
        <Button
          onClick={() =>
            setCocktail({
              ...cocktail,
              ingredients: [
                ...cocktail.ingredients,
                {
                  value: 0,
                  unit: "ml",
                  text: "",
                },
              ],
            })
          }
        >
          Ajouter un ingrédient
        </Button>
      </Stack>
      <Typography variant="h6">Préparation</Typography>
      <Stack spacing={3} sx={{ my: 3 }} alignItems='center' fullWidth>
        {
          cocktail?.steps.map((step, index) => (
            <Stack key={index} direction="row" spacing={2} alignItems="center" style={{ width: "100%" }}>
              <TextField
                value={step.text}
                onChange={(e) =>
                  setCocktail({
                    ...cocktail,
                    steps: cocktail.steps.map((stepSelected, i) =>
                      i === index ? { ...stepSelected, text: e.target.value } : stepSelected
                    ),
                  })
                }
                name="text"
                label="Etape"
                multiline
                rows={4}
                maxRows={4}
                fullWidth
              />
              <IconButton
                onClick={() =>
                  setCocktail({
                    ...cocktail,
                    steps: cocktail.steps.filter((stepF, i) => i !== index),
                  })
                }
              >
                <Iconify icon="bi:trash" />
              </IconButton>
            </Stack>
          ))
        }
        <Button
          onClick={() =>
            setCocktail({
              ...cocktail,
              steps: [
                ...cocktail.steps,
                {
                  text: "",
                },
              ],
            })
          }
        >
          Ajouter une étape
        </Button>
      </Stack>
      <TextField
        value={cocktail?.description}
        onChange={(e) => setCocktail({ ...cocktail, description: e.target.value })}
        name="description"
        label="Description"
        multiline
        rows={6}
        maxRows={10}
        fullWidth
      />


      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        onClick={handleSubmit}
      >
        Modifir le cocktail
      </LoadingButton>
    </>
  );

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: '/assets/background/overlay_4.jpg',
        }),
        height: 1,
      }}
    >
      <Logo
        sx={{
          position: 'fixed',
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
        }}
      />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card
          sx={{
            p: 5,
            width: 1,
          }}
        >
          <Typography variant="h4">Cocktail {cocktail.name}</Typography>
          {renderForm}
        </Card>
      </Stack>
    </Box>
  );
}
