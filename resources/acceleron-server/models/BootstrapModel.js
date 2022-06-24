'use strict';
let BaseModel = ACCELERONCORE._models.BaseModel;


class BootstrapModel extends BaseModel {
  constructor(request) {
    super(request);
    this.couch = ACCELERONCORE._connectors.CouchDBAsync;
  }

 

  async getAllActionRequests() {
    return await this.couch.get('/accelerate_action_requests/_design/requests/_view/fetchall',
    ).catch((error) => { throw error });
      
  }

  async getActionRequestById(actionRequestId) {
    return await this.couch.get(`/accelerate_action_requests/${actionRequestId}`,
    ).catch((error) => { throw error });
  }


  async deleteActionRequestById(actionRequestId,actionRequestRev) {
    const data = await this.couch.delete('/accelerate_action_requests/'+actionRequestId+'?rev='+actionRequestRev).catch(error => {
      throw error;
  });

  return data;
  }    
  
}
module.exports = BootstrapModel;
