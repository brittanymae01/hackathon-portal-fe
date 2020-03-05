// Creates a hackathon
// Do we need a hackathon URL? yes

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import useForm from 'react-hook-form';
import { useAuth0 } from '../../auth0-hooks/react-auth0-spa';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom'

// COMPONENTS
import Stepper from './Stepper';
import OrganizerProjectList from '../Organizers/OrganizerProjectList';

// ACTIONS
import { createHackathon } from '../../actions/actions';

import "../../sass/stepper/stepper.scss";
import "../../sass/hackathonModel/hackathonModel.scss";
import "../../sass/createHackathon/createHackathon.scss";

// STYLE
import 'date-fns';
import TextField from '@material-ui/core/TextField';
import {
   Button,
   Typography,
   InputAdornment,
   makeStyles,
   withStyles,
   Checkbox,
   FormControlLabel,
} from '@material-ui/core';
import TodayIcon from '@material-ui/icons/Today';
import EventIcon from '@material-ui/icons/Event';
import ScheduleIcon from '@material-ui/icons/Schedule';
import DateFnsUtils from '@date-io/date-fns';
import {
   MuiPickersUtilsProvider,
   KeyboardTimePicker,
   KeyboardDatePicker
} from '@material-ui/pickers';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import InputBase from '@material-ui/core/InputBase';
import Radio from '@material-ui/core/Radio';
import { blue, red } from '@material-ui/core/colors';
import { relativeTimeRounding } from 'moment';



// const BootstrapInput = withStyles(theme => ({
//    root: {
//       'label + &': {
//          marginTop: theme.spacing(3),
//       },
//    },
//    input: {
//       borderRadius: 3,
//       position: 'relative',
//       backgroundColor: theme.palette.background.paper,
//       border: '1px solid #ced4da',
//       fontSize: 16,
//       transition: theme.transitions.create(['border-color', 'box-shadow']),
//       fontFamily: [
//          '-apple-system',
//          'BlinkMacSystemFont',
//          '"Segoe UI"',
//          'Roboto',
//          '"Helvetica Neue"',
//          'Arial',
//          'sans-serif',
//          '"Apple Color Emoji"',
//          '"Segoe UI Emoji"',
//          '"Segoe UI Symbol"',
//       ].join(','),
//       '&:focus': {
//          borderRadius: 4,
//          borderColor: '#80bdff',
//          boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
//       },
//    },
// }))(InputBase);

const useStyles = makeStyles(theme => ({
   container: {
      // border: '10px solid green',
      width: '100%',
      // height: '10vh',
      // height: '200px',
      // background: 'blue',
   },
   label: {
      background: '#D0DDFF',
      borderRadius: '5px',
      marginBottom: '20px',
   },
   root: {
      overflow: 'auto',
      padding: '3%',
      borderRadius: '4px',
      width: '80%',
      // '& > *': {

      //    width: '100%',
      // },
      margin: 'auto',
   },
   button: {
      width: '150px',
      // marginTop: '50px'
   },
   formControl: {
      width: '100 %',
      // margin: theme.spacing(1),
      // minWidth: 120,
   },
   selectEmpty: {
      // marginTop: theme.spacing(2),
   },
   icon: {
      borderRadius: '50%',
      width: 16,
      height: 16,
      boxShadow: 'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
      backgroundColor: '#f5f8fa',
      backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
      '$root.Mui-focusVisible &': {
         outline: '2px auto rgba(19,124,189,.6)',
         outlineOffset: 2,
      },
      'input:hover ~ &': {
         backgroundColor: '#ebf1f5',
      },
      'input:disabled ~ &': {
         boxShadow: 'none',
         background: 'rgba(206,217,224,.5)',
      },
   },
   checkedIcon: {
      backgroundColor: '#137cbd',
      backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
      '&:before': {
         display: 'block',
         width: 16,
         height: 16,
         backgroundImage: 'radial-gradient(#fff,#fff 28%,transparent 32%)',
         content: '""',
      },
      'input:hover ~ &': {
         backgroundColor: '#106ba3',
      },
   },
   activeButton: {
      backgroundColor: '#4885E1',
      color: '#0A0A0B',
      width: '8%',
      // marginLeft: '3%',
   },
   backButton: {
      border: '1px solid #4885E1',
      color: '#4885E1'
   },
   buttonsContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      top: 0,
      right: 0,
   },
   buttonsSubContainer: {
      top: 0,
      right: 0,
      // display: 'flex',
      // justifyContent: 'space-between'
   }
}));

function StyledRadio(props) {
   const classes = useStyles();


   return (
      <Radio
         className={classes.root}
         disableRipple
         color="default"
         checkedIcon={<span className={clsx(classes.icon, classes.checkedIcon)} />}
         icon={<span className={classes.icon} />}
         {...props}
      />
   );
}

const CreateHackathon = props => {
   const [page1Info, setPage1Info] = useState({});
   const [start_date, setStart_date] = useState(`${new Date()}`);
   const [end_date, setEnd_date] = useState(`${new Date()}`);
   const [hackathonInfo, setHackathonInfo] = useState({
      name: '',
      description: '',
      location: '',
      url: '',
      start_date: '',
      end_date: '',
      is_open: '',
      max_team_participants: 0,
   });
   const [state, setState] = useState({ is_open: true });
   const [max, setMax] = useState();
   const { loading, user } = useAuth0();
   const dispatch = useDispatch();
   const classes = useStyles();
   const [activeStep, setActiveStep] = React.useState(0);
   const [nameLength, setNameLength] = React.useState(true)
   const [descLength, setDescLength] = React.useState(true)
   const [locationLength, setLocationLength] = React.useState(true)
   const [id, setId] = useState(0)
   const history = useHistory()



   let { register, handleSubmit, errors, clearError } = useForm();

   useEffect(() => {
      setHackathonInfo({
         ...page1Info,
         start_date: `${start_date}`,
         end_date: `${end_date}`,
         is_open: state.is_open,
         max_team_participants: max,
      });
   }, [page1Info, start_date, end_date, state, max]);

   const handlePage1Change = e => {
      if (page1Info.hasOwnProperty('name') && page1Info.name.trim().length) setNameLength(true)
      if (page1Info.hasOwnProperty('description') && page1Info.description.trim().length) setDescLength(true)
      if (page1Info.hasOwnProperty('location') && page1Info.location.trim().length) setLocationLength(true)
      setPage1Info({ ...page1Info, [e.target.name]: e.target.value });
   };

   const handleStartDateChange = date => {
      setStart_date(date.toString());
   };

   const handleEndDateChange = date => {
      setEnd_date(date.toString());
   };

   const handleOpenChange = name => e => {
      setState({ [name]: e.target.checked });
   };

   function getStepContent(step) {
      switch (step) {
         case 0:
            return 'Hackathon basic details';
         case 1:
            return 'Hackathon date and time';
         case 2:
            return 'Create projects';
         default:
            return 'Unknown step';
      }
   }

   const handleNext = () => {
      if (!page1Info.hasOwnProperty('name') || !page1Info.name.trim().length) {
         setNameLength(false)
      } if (!page1Info.hasOwnProperty('description') || !page1Info.description.trim().length) {
         setDescLength(false)
      } if (!page1Info.hasOwnProperty('location') || !page1Info.location.trim().length) {
         setLocationLength(false)
      }
      else {
         nextStep();

      }
      //  console.log(nameLength, descLength, locationLength)
      //  console.log(page1Info)
   };

   function nextStep() {
      if (activeStep === 1) {
         const user_id = user.sub.replace('auth0|', '');
         dispatch(createHackathon(user_id, hackathonInfo, history, setId, setActiveStep));
      } else {
         setActiveStep(prevActiveStep => prevActiveStep + 1);
      }
   }

   // useEffect(() => { debugger }, [hackathonInfo])

   const handleBack = () => {
      setActiveStep(prevActiveStep => prevActiveStep - 1);
   };

   const handleChange = e => {
      setMax(Number(e.target.value));
      console.log(Number(e.target.value));
   };

   const handleFormSubmit = (data, e) => {
      history.push()
   };

   return (
      <div className='create-hackathon-container' >
         <div className='stepper-container'>
            <Typography className={classes.instructions}>{getStepContent(activeStep)}</Typography>
            <Stepper
               activeStep={activeStep}
               setActiveStep={setActiveStep}
            />
         </div>
         <form
            noValidate autoComplete="off"
            className={classes.root}
            onSubmit={handleSubmit(handleFormSubmit)}
         >
            {activeStep === 0 && (
               <>
                  <label className="name">
                     <TextField
                        type="text"
                        fullWidth
                        label="Hackathon Name"
                        name="name"
                        variant="filled"
                        margin="dense"
                        className={classes.active}
                        defaultValue={page1Info.name}
                        onChange={handlePage1Change}
                        inputRef={register({ required: true })}
                        InputProps={{
                           startAdornment: (
                              <InputAdornment position="start"></InputAdornment>
                           )
                        }}
                     />
                     {!nameLength ? <p className='create-error'>Please include a name</p> : null}
                     <p>* Required</p>

                     <label className="url">

                        <TextField
                           className={classes.active}
                           type="text"
                           fullWidth
                           name="url"
                           variant="filled"
                           label='Hackathon URL'
                           margin="dense"
                           defaultValue={page1Info.url}
                           onChange={handlePage1Change}
                           inputRef={register}
                           InputProps={{
                              startAdornment: (
                                 <InputAdornment position="start">
                                    {/* <LanguageIcon /> */}
                                 </InputAdornment>
                              )
                           }}
                        />
                     </label>

                     <label className="location-input">

                        <TextField
                           className={classes.active}
                           type="text"
                           fullWidth
                           name="location"
                           variant="filled"
                           margin="dense"
                           label='Hackathon Location'
                           defaultValue={page1Info.location}
                           onChange={handlePage1Change}
                           inputRef={register}
                           InputProps={{
                              startAdornment: (
                                 <InputAdornment position="start">
                                    {/* <LocationOnIcon /> */}
                                 </InputAdornment>
                              )
                           }}
                        />
                        {!locationLength ? <p className='create-error'>Please include a location (ex. San Francisco, Online, etc)</p> : null}
                     </label>
                     <p>* Required</p>

                     <TextField
                        className={classes.active}
                        type="text"
                        fullWidth
                        multiline
                        rows="4"
                        name="description"
                        variant="filled"
                        label='Hackathon Description'
                        margin="dense"
                        defaultValue={page1Info.description}
                        onChange={handlePage1Change}
                        inputRef={register}
                     // InputProps={{
                     //    startAdornment: (
                     //       <InputAdornment position="start">
                     //          {/* <DescriptionIcon /> */}
                     //       </InputAdornment>
                     //    )
                     // }}
                     />

                  </label>
                  {!descLength ? <p className='create-error'>Please include a description</p> : null}
                  <p>* Required</p>
               </>
            )}
            {activeStep === 1 && (
               <>
                  <div>
                     <label className="startDate">
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                           <KeyboardDatePicker
                              className={classes.active}
                              autoOk
                              fullWidth
                              name="startDate"
                              margin="dense"
                              label='Start date'
                              inputVariant="filled"
                              format="MM/dd/yyyy"
                              keyboardIcon={
                                 <TodayIcon style={{ color: 'black' }} />
                              }
                              inputRef={register}
                              value={start_date}
                              InputAdornmentProps={{ position: 'start' }}
                              onChange={handleStartDateChange}
                           />
                        </MuiPickersUtilsProvider>
                     </label>
                     <label className="startTime">
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                           <KeyboardTimePicker
                              className={classes.active}
                              fullWidth
                              ampm={true}
                              name="startTime"
                              margin="dense"
                              label='Start time'
                              inputVariant="filled"
                              value={start_date}
                              onChange={handleStartDateChange}
                              inputRef={register}
                              keyboardIcon={
                                 <ScheduleIcon style={{ color: 'black' }} />
                              }
                              InputAdornmentProps={{ position: 'start' }}
                           />
                        </MuiPickersUtilsProvider>
                     </label>
                  </div>
                  <div>
                     <label className="endDate">
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                           <KeyboardDatePicker
                              className={classes.active}
                              fullWidth
                              autoOk
                              name="endDate"
                              label='End date'
                              margin="dense"
                              inputVariant="filled"
                              format="MM/dd/yyyy"
                              keyboardIcon={
                                 <EventIcon style={{ color: 'black' }} />
                              }
                              inputRef={register}
                              value={end_date}
                              InputAdornmentProps={{ position: 'start' }}
                              onChange={handleEndDateChange}
                           />
                        </MuiPickersUtilsProvider>
                     </label>
                     <label className="endTime">
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                           <KeyboardTimePicker
                              className={classes.active}
                              fullWidth
                              ampm={true}
                              name="endTime"
                              margin="dense"
                              label='End Time'
                              inputVariant="filled"
                              value={end_date}
                              onChange={handleEndDateChange}
                              inputRef={register}
                              keyboardIcon={
                                 <ScheduleIcon style={{ color: 'black' }} />
                              }
                              InputAdornmentProps={{ position: 'start' }}
                           />
                        </MuiPickersUtilsProvider>
                     </label>
                     <label>
                        <FormControlLabel
                           control={
                              <Checkbox
                                 checked={state.is_open}
                                 onChange={handleOpenChange('is_open')}
                                 value="checked"
                                 color="primary"
                              />
                           }
                           label="Make hackathon public"
                        />
                     </label>
                  </div>

                  <div>
                     <label className="max-members">
                        {/* <FormControl className={classes.margin}> */}
                        <InputLabel htmlFor="demo-customized-textbox"></InputLabel>
                        <TextField
                           type='number'
                           fullWidth
                           variant="filled"
                           id="demo-customized-textbox"
                           placeholder="Max number of members (up to 30)"
                           value={max}
                           onChange={handleChange} />

                        {/* </FormControl> */}

                     </label>
                  </div>

               </>
            )}

            {activeStep === 2 && (
               <OrganizerProjectList />
            )}

            <div className='modal-button-container'>
               <button className='cancel-button' onClick={() => {
                  props.toggleModal()
               }}>Cancel</button>
               {activeStep === 0 && (
                  <button className='back-button dashboard-buttons' style={{ display: 'none' }} onClick={handleBack}>
                     Back
               </button>)}
               {activeStep > 0 && (
                  <button className='back-button dashboard-buttons' onClick={handleBack}>
                     Back
               </button>)}
               <div className='modal-button-container'>


                  {activeStep === 2 ?
                     <button
                        className='finish-button dashboard-buttons'
                        onClick={() => history.push(`/hackathon/${id}`)}
                     >
                        Finish
                     </button>
                     :
                     <button
                        onClick={handleNext}
                        className='next-button dashboard-buttons'
                     >
                        Next
                     </button>

                  }
               </div>
            </div>
         </form>
      </div >
   );
};

export default CreateHackathon;
