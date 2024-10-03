import express from "express";
import 'dotenv/config';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import Logger from './logger';
import cors from 'cors';
import mongoDb from "./connection/mongoDb";
import getconfig from "./config";
import controllers from './api';
import compression from "compression";
import morganMiddleware from "./middleware/morgan.middleware";
import { errorMiddleware } from "./middleware/responseAPI.middleware";
import Controller from "./interface/controller.interface";
import { agenda } from "./utils/agendaScheduling";

class App{
    public app: express.Application;

    constructor(){
        this.app= express();

        Promise.all([
            this.connectToTheDatabase(),
            this.initializeMiddleware(),
            this.initializeControllers(),
            this.initializeErrorHandling()
        ]).then(()=>{
            this.listen();
        })
    };

    private async connectToTheDatabase(){
        await mongoDb.init();
    }

    private async initializeMiddleware() {
      this.app.use('/export', express.static('src/download'));
      this.app.use(express.urlencoded({ extended: false }));
      this.app.use(express.json({ limit: '50mb' }));
      this.app.use(cors());
      this.app.use(compression());
      this.app.use(morganMiddleware);
    }

    private async initializeErrorHandling() {
      this.app.use(errorMiddleware);
    }
  
    private async initializeControllers() {
      controllers.forEach((controller: Controller) => {
        this.app.use('/', controller.router);
      });
    }

    public async listen():Promise<void>{
    const { PORT, HTTPS_KEY, HTTPS_CERT } = getconfig();
    let server = http.createServer(this.app);
    if(HTTPS_CERT && HTTPS_KEY){
        const KEY = fs.readFileSync(HTTPS_KEY);
        const CERT = fs.readFileSync(HTTPS_CERT);
        if (KEY && CERT) {
          server = https.createServer({ key: KEY, cert: CERT }, this.app);
        }
    }

    server.listen(PORT, () => {
        Logger.info(`App listening on the PORT ${PORT}`);
      });
  
      (async function () {
        // IIFE to give access to async/await
        await agenda.start();
      })();
    }
}

try {
    new App();
  } catch (e: any) {
    Logger.error(`Error on project startup: ${e.message}`);
  }
  
  process
  .on('unhandledRejection', (response, p) => {
    Logger.error(' ::: ', response);
    Logger.error('p:', p);
  })
  .on('uncaughtException', (err) => {
    Logger.error('err ::', err);
  });

export default App;