trigger ParticipanAddEventTrigger on Participant__c (after update,after insert,after delete) {
    
    if(Trigger.isAfter){
        if(Trigger.isUpdate){
            ParticipantAddEventTriggerHandler.addParticipantToEventAfterUpdate(Trigger.new,Trigger.old);
        }
        if(Trigger.isInsert){
            ParticipantAddEventTriggerHandler.addParticipantToEventAfterInsert(Trigger.new);
        }
        if(Trigger.isDelete){
            ParticipantAddEventTriggerHandler.deleteParticipantFromEventAfterDeleteHim(Trigger.old);
        }
    }
    
}