package lk.ijse.gdse65.pos_system_spring.service;

import jakarta.transaction.Transactional;
import lk.ijse.gdse65.pos_system_spring.conversion.ConversionData;
import lk.ijse.gdse65.pos_system_spring.dto.ItemDTO;

import lk.ijse.gdse65.pos_system_spring.entity.ItemEntity;
import lk.ijse.gdse65.pos_system_spring.exception.NotFoundException;
import lk.ijse.gdse65.pos_system_spring.repository.ItemDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ItemServiceIMPL implements ItemService{
    @Autowired
    private ItemDAO itemDAO;
    @Autowired
    private ConversionData convert;
    @Override
    public ItemDTO saveItem(ItemDTO item) {
        return convert.convertToItemDTO(itemDAO.save(convert.convertToItemEntity(item)));
    }

    @Override
    public List<ItemDTO> getAllItem() {
        return convert.getItemDTOList(itemDAO.findAll());
    }

    @Override
    public ItemDTO getSelectedItem(String id) {
        if (!itemDAO.existsById(id)) throw new NotFoundException("ITEM NOT FOUND");
        return convert.convertToItemDTO(itemDAO.getReferenceById(id));
    }

    @Override
    public void deleteItem(String id) {
        if (!itemDAO.existsById(id)) throw new NotFoundException("ITEM NOT FOUND");
        itemDAO.deleteById(id);
    }

    @Override
    public void updateItem(String id, ItemDTO item) {
        Optional<ItemEntity> tmpItem = itemDAO.findById(id);
        if (!tmpItem.isPresent()) throw new NotFoundException("ITEM NOT FOUND");
        tmpItem.get().setDescription(item.getDescription());
        tmpItem.get().setQty(item.getQty());
        tmpItem.get().setUnitPrice(item.getUnitPrice());
    }
}
