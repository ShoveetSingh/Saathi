require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bp = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();

app.use(session({
  secret:'#0987654321qwert',
  resave:false,
  saveUninitialized:true,
}))

app.use(express.json());

app.use(bp.json());

app.use(bp.urlencoded({ extended: true }));

app.use(express.static('public'));
 
app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/public/index.html');
})

 
const Mongoclient = require('mongodb').MongoClient;
const uri = process.env.URL;
const client = new Mongoclient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



client.connect((err) => {
    if(err)
    console.log(err);
    else{
        console.log('Connected to database');
    }

})

const collection = client.db('mydb').collection('formdatas') 

const collection2 = client.db('mydb2').collection('Formdatas')



app.post('/addData',async(req,res)=>{
    const data = req.body;
    const {email} = req.body;
    //const {pwd} = req.body;
   const user = await collection.findOne({email:email})
   if(!user){
    collection.insertOne(data,(err,result)=>{
    if (err) {
        console.error('Error inserting data:', err);
        res.status(500).json({ error: 'Failed to insert data' });
      } else {
        
        res.status(200).json({ message: 'Data inserted successfully' });
      }
});

let mailOptions = { 
    from:process.env.USER,
    to:email,
    subject: 'Nodemailer Project',
    text: 'Hello from nodemailer',

}

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        type:'OAUTH2',
        user:process.env.USER,
        pass:process.env.PASS,
        clientId:process.env.CLIENT,
        clientSecret:process.env.CLIENT_SECR,
        refreshToken:process.env.REFRESH_TOKEN,
    }
});

transporter.sendMail(mailOptions,(err,data)=>{
    if(err)
    console.log('Error Occurs',err);
    else
    console.log('Email sent!!!');
    })
    res.redirect('/home.html')
  }
    else{
      res.redirect('/error.html');
     }
})

app.post('/findData', async (req, res) => {
  //console.log("Recieved Request at /findData");
     const {email,pwd} = req.body; 
    try {
      const user =  await collection.findOne({email:email,pwd:pwd});
      //console.log(user);
      if (user) {
        //res.send("Login Successful")
        res.redirect('/home.html');
      } else {
        // Incorrect email or password
        res.status(401).send({ message: 'Incorrect email or password' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  app.post('/appointment', (req, res) => {
    const data = req.body;
    const { email } = req.body; 
    const { doctor } = req.body;
    const { date } = req.body;
    const { time } = req.body;
    
    console.log(email);

  
    collection2.insertOne(data, (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        res.status(500).json({ error: 'Failed to insert data' });
      } else {
        res.redirect('/ind.html');
      }
    });
  
    let mailOptions = {
      from: process.env.USER,
      to: email, // Use the validated 'email' variable
      subject: 'Doctor Appointment at Saathi.com',
      text: `Your appointment has been booked with ${doctor}. Contact 8910132770 for more information.`,
    }
  
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAUTH2',
        user: process.env.USER,
        pass: process.env.PASS,
        clientId: process.env.CLIENT,
        clientSecret: process.env.CLIENT_SECR,
        refreshToken: process.env.REFRESH_TOKEN,
      }
    });
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.log('Error occurs', err);
      } else {
        console.log('Email sent!!!');
      }
    });
  res.redirect('/home.html');
  });
  


app.listen(3000,()=>{
    console.log('Server is running on port 3000');
})

// Path: public/index.html

